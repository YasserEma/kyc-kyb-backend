import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToOrganizationRelationships1700000000051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_relationships" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "organization_relationships" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_relationships" DROP COLUMN IF EXISTS "is_active"`);
    await queryRunner.query(`ALTER TABLE "organization_relationships" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}