import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentFlags1700000000040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_sensitive" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_encrypted" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_required" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_required"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_encrypted"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_sensitive"`);
  }
}