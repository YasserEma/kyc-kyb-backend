import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix remaining schema issues - make scope column nullable
 */
export class FixScopeColumn1734652900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make scope column nullable since entity doesn't use it
    await queryRunner.query(`
      ALTER TABLE lists_management 
      ALTER COLUMN scope DROP NOT NULL;
    `);
    
    console.log('Made scope column nullable in lists_management');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting could cause issues if there are null values
    console.log('Down migration for FixScopeColumn not implemented');
  }
}
