import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to drop old relationship tables and create unified entity_relationships table
 * This migration:
 * 1. Drops old tables: individual_relationships, organization_relationships, organization_entity_associations
 * 2. Creates new unified entity_relationships table
 * 3. Adds foreign keys, indexes, and unique constraints
 */
export class CreateEntityRelationships1732566650000 implements MigrationInterface {
    name = 'CreateEntityRelationships1732566650000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old relationship tables (this will delete data!)
        await queryRunner.query(`DROP TABLE IF EXISTS "individual_relationships" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organization_relationships" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organization_entity_associations" CASCADE`);

        // Create new unified entity_relationships table
        await queryRunner.query(`
      CREATE TABLE "entity_relationships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "from_entity_id" uuid NOT NULL,
        "to_entity_id" uuid NOT NULL,
        "relationship_type" text NOT NULL,
        "metadata" jsonb,
        "start_date" TIMESTAMP,
        "end_date" TIMESTAMP,
        CONSTRAINT "PK_entity_relationships" PRIMARY KEY ("id")
      )
    `);

        // Add foreign key constraints
        await queryRunner.query(`
      ALTER TABLE "entity_relationships"
      ADD CONSTRAINT "FK_entity_relationships_from_entity"
      FOREIGN KEY ("from_entity_id")
      REFERENCES "entities"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE "entity_relationships"
      ADD CONSTRAINT "FK_entity_relationships_to_entity"
      FOREIGN KEY ("to_entity_id")
      REFERENCES "entities"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

        // Add indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_entity_relationships_from_entity_id" ON "entity_relationships" ("from_entity_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_entity_relationships_to_entity_id" ON "entity_relationships" ("to_entity_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_entity_relationships_relationship_type" ON "entity_relationships" ("relationship_type")`);
        await queryRunner.query(`CREATE INDEX "IDX_entity_relationships_is_active" ON "entity_relationships" ("is_active")`);

        // Add unique constraint to prevent duplicate active relationships
        // Note: PostgreSQL allows multiple NULLs in unique constraints, but we filter by is_active=true
        await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_entity_relationship_active"
      ON "entity_relationships" ("from_entity_id", "to_entity_id", "relationship_type", "is_active")
      WHERE "is_active" = true AND "deleted_at" IS NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the unified table and its constraints
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_entity_relationship_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_entity_relationships_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_entity_relationships_relationship_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_entity_relationships_to_entity_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_entity_relationships_from_entity_id"`);

        await queryRunner.query(`ALTER TABLE "entity_relationships" DROP CONSTRAINT IF EXISTS "FK_entity_relationships_to_entity"`);
        await queryRunner.query(`ALTER TABLE "entity_relationships" DROP CONSTRAINT IF EXISTS "FK_entity_relationships_from_entity"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "entity_relationships" CASCADE`);

        // Note: We cannot recreate the old tables without knowing their exact schemas
        // This is a destructive migration - reverting requires manual intervention
        console.warn('WARNING: Old relationship tables cannot be automatically restored. Manual migration required.');
    }
}
