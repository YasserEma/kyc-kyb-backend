import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignIndividualRelationshipsSchema1700000000047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "relationship_start_date" date`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "relationship_end_date" date`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'pending'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "verification_status"`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "relationship_end_date"`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "relationship_start_date"`);
  }
}