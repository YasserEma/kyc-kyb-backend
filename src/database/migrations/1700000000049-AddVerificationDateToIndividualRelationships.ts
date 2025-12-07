import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationDateToIndividualRelationships1700000000049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "verification_date" timestamp`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "verification_method" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "verification_method"`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "verification_date"`);
  }
}