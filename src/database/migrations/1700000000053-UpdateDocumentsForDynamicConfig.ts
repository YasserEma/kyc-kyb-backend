import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsForDynamicConfig1700000000053 implements MigrationInterface {
  name = 'UpdateDocumentsForDynamicConfig1700000000053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension exists for FK defaults if needed
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Add new columns if missing
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN IF NOT EXISTS "storage_path" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "document_configuration_id" uuid
    `);

    // Convert enum document_type to varchar(100) if it's enum
    const enumTypeName = 'documents_document_type_enum';
    try {
      await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "document_type" TYPE VARCHAR(100) USING "document_type"::text`);
      await queryRunner.query(`DROP TYPE IF EXISTS "${enumTypeName}"`);
    } catch (e) {
      // If already varchar, ignore
    }

    // Add FK to document_configurations
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_documents_document_configuration_id'
        ) THEN
          ALTER TABLE "documents"
          ADD CONSTRAINT "FK_documents_document_configuration_id"
          FOREIGN KEY ("document_configuration_id") REFERENCES "document_configurations"("id") ON DELETE SET NULL;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_documents_document_configuration_id'
        ) THEN
          ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_document_configuration_id";
        END IF;
      END$$;
    `);

    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "document_configuration_id"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "storage_path"`);
  }
}