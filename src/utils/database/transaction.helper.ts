import { DataSource, QueryRunner } from 'typeorm';
import { DATABASE_CONSTANTS, IsolationLevel } from '../constants/database.constants';

export class TransactionHelper {
  /**
   * Executes a function within a database transaction
   */
  static async withTransaction<T>(
    dataSource: DataSource,
    operation: (queryRunner: QueryRunner) => Promise<T>,
    isolationLevel?: IsolationLevel
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      if (isolationLevel) {
        await queryRunner.startTransaction(isolationLevel);
      } else {
        await queryRunner.startTransaction();
      }
      
      const result = await operation(queryRunner);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executes multiple operations in a single transaction
   */
  static async withBatchTransaction<T>(
    dataSource: DataSource,
    operations: Array<(queryRunner: QueryRunner) => Promise<T>>,
    isolationLevel?: IsolationLevel
  ): Promise<T[]> {
    return this.withTransaction(
      dataSource,
      async (queryRunner) => {
        const results: T[] = [];
        
        for (const operation of operations) {
          const result = await operation(queryRunner);
          results.push(result);
        }
        
        return results;
      },
      isolationLevel
    );
  }

  /**
   * Executes a function with retry logic in case of transaction conflicts
   */
  static async withRetryableTransaction<T>(
    dataSource: DataSource,
    operation: (queryRunner: QueryRunner) => Promise<T>,
    maxRetries: number = 3,
    isolationLevel?: IsolationLevel
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withTransaction(dataSource, operation, isolationLevel);
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable (serialization failure, deadlock, etc.)
        if (this.isRetryableError(error) && attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(delay);
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error('Transaction failed after all retries');
  }

  /**
   * Checks if an error is retryable
   */
  private static isRetryableError(error: any): boolean {
    if (!error || typeof error.code !== 'string') {
      return false;
    }
    
    // PostgreSQL error codes for retryable errors
    const retryableCodes = [
      '40001', // serialization_failure
      '40P01', // deadlock_detected
      '53300', // too_many_connections
      '08006', // connection_failure
    ];
    
    return retryableCodes.includes(error.code);
  }

  /**
   * Sleep utility for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a savepoint within an existing transaction
   */
  static async withSavepoint<T>(
    queryRunner: QueryRunner,
    operation: () => Promise<T>,
    savepointName?: string
  ): Promise<T> {
    const savepoint = savepointName || `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await queryRunner.query(`SAVEPOINT ${savepoint}`);
      const result = await operation();
      await queryRunner.query(`RELEASE SAVEPOINT ${savepoint}`);
      return result;
    } catch (error) {
      await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      throw error;
    }
  }
}