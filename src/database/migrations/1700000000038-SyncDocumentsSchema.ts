import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncDocumentsSchema1700000000038 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_name" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "original_file_name" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "file_extension" varchar(50)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "file_size" bigint`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "verification_status" varchar(50) DEFAULT 'pending'`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_status" varchar(50) DEFAULT 'uploaded'`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "issuing_authority" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "issuing_country" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_number" varchar(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "document_number"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "issuing_country"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "issuing_authority"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "document_status"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "verification_status"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "file_size"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "file_extension"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "original_file_name"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "document_name"`);
  }
}