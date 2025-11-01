import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumnNameMismatches1700000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename phone_number to phone
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      RENAME COLUMN phone_number TO phone;
    `);

    // Add missing columns that the entity expects but don't exist
    // Note: first_name, last_name, password_hash were already added in previous migration
    // Just ensure phone column has correct constraints
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      ALTER COLUMN phone TYPE varchar(20);
    `);

    // Update any existing data if needed
    await queryRunner.query(`
      UPDATE subscriber_users 
      SET phone = NULL 
      WHERE phone = '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename phone back to phone_number
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      RENAME COLUMN phone TO phone_number;
    `);

    // Revert phone column type
    await queryRunner.query(`
      ALTER TABLE subscriber_users 
      ALTER COLUMN phone_number TYPE text;
    `);
  }
}