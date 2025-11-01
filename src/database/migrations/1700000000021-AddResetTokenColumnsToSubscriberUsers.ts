import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetTokenColumnsToSubscriberUsers1700000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to subscriber_users table
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS hashed_refresh_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
      ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB,
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS permissions JSONB,
      ADD COLUMN IF NOT EXISTS preferences JSONB,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login_ip INET,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_by UUID
    `);

    // Update existing data to match new schema
    await queryRunner.query(`
      UPDATE subscriber_users 
      SET 
        first_name = COALESCE(SPLIT_PART(name, ' ', 1), ''),
        last_name = COALESCE(SPLIT_PART(name, ' ', 2), ''),
        password_hash = COALESCE(password, ''),
        updated_at = NOW()
      WHERE first_name IS NULL OR last_name IS NULL OR password_hash IS NULL
    `);

    // Add indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_users_reset_token ON subscriber_users (reset_token);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_users_email_verification_token ON subscriber_users (email_verification_token);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_users_status ON subscriber_users (status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      DROP COLUMN IF EXISTS reset_token,
      DROP COLUMN IF EXISTS reset_token_expires,
      DROP COLUMN IF EXISTS hashed_refresh_token,
      DROP COLUMN IF EXISTS google_id,
      DROP COLUMN IF EXISTS email_verification_token,
      DROP COLUMN IF EXISTS email_verified_at,
      DROP COLUMN IF EXISTS two_factor_enabled,
      DROP COLUMN IF EXISTS two_factor_secret,
      DROP COLUMN IF EXISTS two_factor_backup_codes,
      DROP COLUMN IF EXISTS department,
      DROP COLUMN IF EXISTS job_title,
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS first_name,
      DROP COLUMN IF EXISTS last_name,
      DROP COLUMN IF EXISTS password_hash,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS permissions,
      DROP COLUMN IF EXISTS preferences,
      DROP COLUMN IF EXISTS last_login_at,
      DROP COLUMN IF EXISTS last_login_ip,
      DROP COLUMN IF EXISTS failed_login_attempts,
      DROP COLUMN IF EXISTS locked_until,
      DROP COLUMN IF EXISTS deleted_at,
      DROP COLUMN IF EXISTS updated_at,
      DROP COLUMN IF EXISTS updated_by
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriber_users_reset_token`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriber_users_email_verification_token`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriber_users_status`);
  }
}