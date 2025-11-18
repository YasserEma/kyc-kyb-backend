import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtToOrganizationRelationships1700000000050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_relationships" ADD COLUMN IF NOT EXISTS "updated_at" timestamp`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_relationships" DROP COLUMN IF EXISTS "updated_at"`);
  }
}