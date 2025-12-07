import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToIndividualRelationships1700000000046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}