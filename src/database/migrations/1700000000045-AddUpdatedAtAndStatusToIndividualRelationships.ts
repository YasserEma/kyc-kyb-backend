import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtAndStatusToIndividualRelationships1700000000045 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT NOW()`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" ADD COLUMN IF NOT EXISTS "relationship_status" text DEFAULT 'active'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "relationship_status"`);
    await queryRunner.query(`ALTER TABLE "individual_relationships" DROP COLUMN IF EXISTS "updated_at"`);
  }
}