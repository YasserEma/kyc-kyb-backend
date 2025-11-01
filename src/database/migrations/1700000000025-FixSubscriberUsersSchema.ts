import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSubscriberUsersSchema1700000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if name column exists and drop it if it does
    const nameColumnExists = await queryRunner.hasColumn('subscriber_users', 'name');
    if (nameColumnExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users DROP COLUMN name`);
    }

    // Check if first_name column exists, if not add it
    const firstNameExists = await queryRunner.hasColumn('subscriber_users', 'first_name');
    if (!firstNameExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT ''`);
    }

    // Check if last_name column exists, if not add it
    const lastNameExists = await queryRunner.hasColumn('subscriber_users', 'last_name');
    if (!lastNameExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT ''`);
    }

    // Rename password to password_hash if needed
    const passwordExists = await queryRunner.hasColumn('subscriber_users', 'password');
    const passwordHashExists = await queryRunner.hasColumn('subscriber_users', 'password_hash');
    if (passwordExists && !passwordHashExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users RENAME COLUMN password TO password_hash`);
    }

    // Rename phone_number to phone if needed
    const phoneNumberExists = await queryRunner.hasColumn('subscriber_users', 'phone_number');
    const phoneExists = await queryRunner.hasColumn('subscriber_users', 'phone');
    if (phoneNumberExists && !phoneExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users RENAME COLUMN phone_number TO phone`);
    }

    // Add missing columns that don't exist
    const columnsToAdd = [
      { name: 'status', type: 'VARCHAR(20)', default: "'pending'" },
      { name: 'preferences', type: 'JSONB', default: null },
      { name: 'last_login_ip', type: 'INET', default: null },
      { name: 'failed_login_attempts', type: 'INTEGER', default: '0' },
      { name: 'locked_until', type: 'TIMESTAMP', default: null },
      { name: 'reset_token', type: 'VARCHAR(255)', default: null },
      { name: 'reset_token_expires', type: 'TIMESTAMP', default: null },
      { name: 'hashed_refresh_token', type: 'VARCHAR(255)', default: null },
      { name: 'google_id', type: 'VARCHAR(255)', default: null },
      { name: 'email_verification_token', type: 'VARCHAR(255)', default: null },
      { name: 'email_verified_at', type: 'TIMESTAMP', default: null },
      { name: 'two_factor_enabled', type: 'BOOLEAN', default: 'false' },
      { name: 'two_factor_secret', type: 'VARCHAR(255)', default: null },
      { name: 'two_factor_backup_codes', type: 'JSONB', default: null },
      { name: 'department', type: 'VARCHAR(100)', default: null },
      { name: 'job_title', type: 'VARCHAR(100)', default: null },
      { name: 'notes', type: 'TEXT', default: null },
      { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' },
      { name: 'deleted_at', type: 'TIMESTAMP', default: null }
    ];

    for (const column of columnsToAdd) {
      const exists = await queryRunner.hasColumn('subscriber_users', column.name);
      if (!exists) {
        const defaultClause = column.default ? ` DEFAULT ${column.default}` : '';
        await queryRunner.query(`ALTER TABLE subscriber_users ADD COLUMN ${column.name} ${column.type}${defaultClause}`);
      }
    }

    // Create indexes if they don't exist
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_subscriber_users_email ON subscriber_users (email)',
      'CREATE INDEX IF NOT EXISTS idx_subscriber_users_status ON subscriber_users (status)',
      'CREATE INDEX IF NOT EXISTS idx_subscriber_users_deleted_at ON subscriber_users (deleted_at)'
    ];

    for (const indexQuery of indexes) {
      await queryRunner.query(indexQuery);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a complex migration, reverting would be difficult
    // In a production environment, you'd want to be more careful about this
    await queryRunner.query(`
      -- This migration is not easily reversible
      -- Manual intervention may be required
    `);
  }
}