import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToSubscribers1700000000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deleted_at column to subscribers table
    await queryRunner.query(`
      ALTER TABLE subscribers 
      ADD COLUMN deleted_at TIMESTAMP NULL;
    `);

    // Add index for deleted_at column for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subscribers_deleted_at 
      ON subscribers (deleted_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_subscribers_deleted_at;
    `);

    // Drop the deleted_at column
    await queryRunner.query(`
      ALTER TABLE subscribers 
      DROP COLUMN IF EXISTS deleted_at;
    `);
  }
}