import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncEntityCustomFieldsSchema1700000000034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "field_name" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "field_label" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "field_value_json" jsonb`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "field_description" text`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_required" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_searchable" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_editable" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "display_order" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "validation_rules" jsonb`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "field_options" jsonb`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "default_value" text`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "placeholder_text" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "help_text" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "data_source" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "conditional_logic" jsonb`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_encrypted" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "is_pii" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ADD COLUMN IF NOT EXISTS "metadata" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "metadata"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_pii"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_encrypted"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "conditional_logic"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "data_source"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "help_text"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "placeholder_text"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "default_value"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "field_options"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "validation_rules"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "display_order"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_visible"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_editable"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_searchable"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_required"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "field_description"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "field_value_json"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "field_label"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "field_name"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}