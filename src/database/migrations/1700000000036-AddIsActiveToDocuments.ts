import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToDocuments1700000000036 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "updated_by" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "updated_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_active"`);
  }
}