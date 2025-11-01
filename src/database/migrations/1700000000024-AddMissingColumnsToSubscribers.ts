import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToSubscribers1700000000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add status column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN status TEXT DEFAULT 'active';
    `);

    // Add company_name column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN company_name TEXT NULL;
    `);

    // Add company_code column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN company_code TEXT NULL;
    `);

    // Add api_rate_limit column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN api_rate_limit INTEGER NULL;
    `);

    // Add last_login_at column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN last_login_at TIMESTAMP NULL;
    `);

    // Add last_login_ip column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN last_login_ip TEXT NULL;
    `);

    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscribers_status 
      ON subscribers (status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscribers_company_name 
      ON subscribers (company_name);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscribers_last_login_at 
      ON subscribers (last_login_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_subscribers_last_login_at;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_subscribers_company_name;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_subscribers_status;
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS last_login_ip;
    `);

    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS last_login_at;
    `);

    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS api_rate_limit;
    `);

    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS company_code;
    `);

    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS company_name;
    `);

    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS status;
    `);
  }
}