import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityHistoryMissingColumns1700000000032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns that EntityHistoryEntity expects
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS new_values JSONB`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS change_description TEXT`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS changed_fields JSONB`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS change_reason VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS metadata JSONB`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS session_id VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS api_version VARCHAR(50)`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS is_system_change BOOLEAN DEFAULT false`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS version_number INTEGER`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS validation_errors JSONB`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS is_reversible BOOLEAN DEFAULT true`);
    await queryRunner.query(`ALTER TABLE entity_history ADD COLUMN IF NOT EXISTS reversal_instructions TEXT`);

    // Rename 'changes' to 'old_values' if it exists
    const columnExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'entity_history' AND column_name = 'changes'
    `);
    
    if (columnExists.length > 0) {
      await queryRunner.query(`ALTER TABLE entity_history RENAME COLUMN changes TO old_values`);
    }

    // Make changed_by nullable (it should be nullable according to EntityHistoryEntity)
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN changed_by DROP NOT NULL`);

    // Add missing indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_entity_history_change_type ON entity_history (change_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_entity_history_updated_at ON entity_history (updated_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_entity_history_deleted_at ON entity_history (deleted_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_entity_history_is_active ON entity_history (is_active)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the columns we added (this is a best-effort rollback)
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS new_values`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS change_description`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS changed_fields`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS change_reason`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS metadata`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS session_id`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS correlation_id`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS api_version`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS is_system_change`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS batch_id`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS version_number`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS validation_errors`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS is_reversible`);
    await queryRunner.query(`ALTER TABLE entity_history DROP COLUMN IF EXISTS reversal_instructions`);

    // Rename old_values back to changes
    await queryRunner.query(`ALTER TABLE entity_history RENAME COLUMN IF EXISTS old_values TO changes`);

    // Make changed_by NOT NULL again
    await queryRunner.query(`ALTER TABLE entity_history ALTER COLUMN changed_by SET NOT NULL`);

    // Drop indexes we created
    await queryRunner.query(`DROP INDEX IF EXISTS idx_entity_history_change_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_entity_history_updated_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_entity_history_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_entity_history_is_active`);
  }
}