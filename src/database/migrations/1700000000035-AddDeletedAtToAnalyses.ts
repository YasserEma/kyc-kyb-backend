import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToAnalyses1700000000035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "screening_analysis" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "screening_analysis" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "risk_analysis" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "risk_analysis" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risk_analysis" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(`ALTER TABLE "risk_analysis" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "screening_analysis" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(`ALTER TABLE "screening_analysis" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}