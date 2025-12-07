import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityHistoryColumns1700000000030 implements MigrationInterface {
  name = 'FixEntityHistoryColumns1700000000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing BaseEntity columns to entity_history table
    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT TRUE;
    `);

    // Update existing columns to match the new schema
    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ALTER COLUMN "changed_at" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ALTER COLUMN "changed_by" DROP NOT NULL;
    `);

    // Create indexes for the new columns
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_entity_history_created_at" 
      ON "entity_history" ("created_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_entity_history_updated_at" 
      ON "entity_history" ("updated_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_entity_history_is_active" 
      ON "entity_history" ("is_active");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns if rolling back
    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      DROP COLUMN IF EXISTS "created_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      DROP COLUMN IF EXISTS "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      DROP COLUMN IF EXISTS "deleted_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      DROP COLUMN IF EXISTS "is_active";
    `);

    // Restore the original constraints
    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ALTER COLUMN "changed_at" SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "entity_history" 
      ALTER COLUMN "changed_by" SET NOT NULL;
    `);
  }
}