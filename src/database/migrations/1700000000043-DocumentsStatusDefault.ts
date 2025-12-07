import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentsStatusDefault1700000000043 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'uploaded'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`UPDATE "documents" SET "status" = 'uploaded' WHERE "status" IS NULL`);
    await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" SET NOT NULL`);
  }
}