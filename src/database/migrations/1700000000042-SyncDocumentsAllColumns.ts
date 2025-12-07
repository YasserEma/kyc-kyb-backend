import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncDocumentsAllColumns1700000000042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_subtype" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "file_hash" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "issue_date" date`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verification_notes" text`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verified_by" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verification_date" date`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "rejection_reason" text`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "rejected_by" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "rejection_date" date`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "extracted_data" jsonb`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "ocr_data" jsonb`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "confidence_score" decimal(5,2)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "validation_results" jsonb`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "storage_provider" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "storage_reference" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "backup_location" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "last_accessed_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "last_accessed_by" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "retention_until" date`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "retention_policy" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "tags" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "tags"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "retention_policy"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "retention_until"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "last_accessed_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "last_accessed_at"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "download_count"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "backup_location"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "storage_reference"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "storage_provider"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "validation_results"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "confidence_score"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "ocr_data"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "extracted_data"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "rejection_date"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "rejected_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "rejection_reason"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "verification_date"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "verified_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "verification_notes"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "issue_date"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "file_hash"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "document_subtype"`);
  }
}