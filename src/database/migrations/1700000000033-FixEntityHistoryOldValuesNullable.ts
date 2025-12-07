import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityHistoryOldValuesNullable1700000000033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make old_values column nullable since EntityHistoryEntity expects it to be nullable
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN old_values DROP NOT NULL`);
    
    // Also make new_values nullable for consistency
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN new_values DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes if needed
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN old_values SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN new_values SET NOT NULL`);
  }
}