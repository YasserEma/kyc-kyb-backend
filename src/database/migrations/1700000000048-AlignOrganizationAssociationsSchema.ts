import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignOrganizationAssociationsSchema1700000000048 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "association_status" text`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "verification_date" timestamp`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "verification_method" text`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "last_reviewed_date" timestamp`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "next_review_date" date`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "risk_level" text`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "risk_factors" text`);
    await queryRunner.query(`ALTER TABLE "organization_associations" ADD COLUMN IF NOT EXISTS "notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "notes"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "risk_factors"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "risk_level"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "next_review_date"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "last_reviewed_date"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "reviewed_by"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "verification_method"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "verification_date"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "is_verified"`);
    await queryRunner.query(`ALTER TABLE "organization_associations" DROP COLUMN IF EXISTS "association_status"`);
  }
}