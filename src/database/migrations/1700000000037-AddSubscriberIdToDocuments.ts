import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriberIdToDocuments1700000000037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "subscriber_id" uuid`);
    await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "fk_documents_subscriber" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE SET NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_documents_subscriber_id" ON "documents" ("subscriber_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_documents_subscriber_id"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "fk_documents_subscriber"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "subscriber_id"`);
  }
}