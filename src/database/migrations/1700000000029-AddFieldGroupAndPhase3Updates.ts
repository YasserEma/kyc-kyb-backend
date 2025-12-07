import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldGroupAndPhase3Updates1700000000029 implements MigrationInterface {
  name = 'AddFieldGroupAndPhase3Updates1700000000029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add field_group column to entity_custom_fields table
    await queryRunner.query(`
      ALTER TABLE "entity_custom_fields" 
      ADD COLUMN IF NOT EXISTS "field_group" varchar(255);
    `);

    // Add index on field_group for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_entity_custom_fields_field_group" 
      ON "entity_custom_fields" ("field_group");
    `);

    // Add index on entity_id and field_group combination
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_entity_custom_fields_entity_group" 
      ON "entity_custom_fields" ("entity_id", "field_group");
    `);

    // Add verification columns to organization_associations if they don't exist
    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT false;
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      ADD COLUMN IF NOT EXISTS "verified_by" uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      ADD COLUMN IF NOT EXISTS "verified_at" timestamp;
    `);

    // Add foreign key constraint for verified_by
    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      ADD CONSTRAINT "fk_organization_associations_verified_by" 
      FOREIGN KEY ("verified_by") REFERENCES "subscriber_users"("id");
    `);

    // Add index on verification status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_associations_verified" 
      ON "organization_associations" ("verified");
    `);

    // Add next_review_date column to organization_associations
    await queryRunner.query(`
      ALTER TABLE "organization_associations"
      ADD COLUMN IF NOT EXISTS "next_review_date" DATE;
    `);

    // Add index on next_review_date for organization_associations
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_associations_next_review" 
      ON "organization_associations" ("next_review_date");
    `);

    // Add risk_level column to organization_associations if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      ADD COLUMN IF NOT EXISTS "risk_level" varchar(50) DEFAULT 'medium';
    `);

    // Add index on risk_level
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_associations_risk_level" 
      ON "organization_associations" ("risk_level");
    `);

    // Update organization_relationships table with additional indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_relationships_verified" 
      ON "organization_relationships" ("verified");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_relationships_effective_from" 
      ON "organization_relationships" ("effective_from");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_relationships_effective_to" 
      ON "organization_relationships" ("effective_to");
    `);

    // Add ownership_percentage index
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_organization_relationships_ownership" 
      ON "organization_relationships" ("ownership_percentage");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_relationships_ownership";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_relationships_effective_to";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_relationships_effective_from";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_relationships_verified";`);
    
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_associations_risk_level";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_associations_next_review";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_organization_associations_verified";`);
    
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_entity_custom_fields_entity_group";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_entity_custom_fields_field_group";`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      DROP CONSTRAINT IF EXISTS "fk_organization_associations_verified_by";
    `);

    // Drop columns from organization_associations
    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      DROP COLUMN IF EXISTS "risk_level";
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      DROP COLUMN IF EXISTS "verified_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      DROP COLUMN IF EXISTS "verified_by";
    `);

    await queryRunner.query(`
      ALTER TABLE "organization_associations" 
      DROP COLUMN IF EXISTS "verified";
    `);

    // Drop field_group column from entity_custom_fields
    await queryRunner.query(`
      ALTER TABLE "entity_custom_fields" 
      DROP COLUMN IF EXISTS "field_group";
    `);
  }
}