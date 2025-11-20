import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentConfigurations1700000000052 implements MigrationInterface {
  name = 'CreateDocumentConfigurations1700000000052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "document_configurations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "name" text NOT NULL,
        "code" text NOT NULL,
        "allowed_extensions" jsonb NOT NULL DEFAULT '[]',
        "max_size_bytes" bigint NOT NULL DEFAULT 0,
        "is_expiry_required" boolean NOT NULL DEFAULT false
      );
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_document_configurations_code" ON "document_configurations" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_document_configurations_active" ON "document_configurations" ("is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_document_configurations_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_document_configurations_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "document_configurations"`);
  }
}