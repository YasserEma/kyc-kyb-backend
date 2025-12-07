import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingDocumentColumns1700000000054 implements MigrationInterface {
  name = 'AddMissingDocumentColumns1700000000054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns that exist in the entity but not in the database
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "category" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "section" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "uploaded_by" uuid`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "metadata" jsonb`);
    
    // Add foreign key constraint for uploaded_by if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_documents_uploaded_by'
        ) THEN
          ALTER TABLE "documents"
          ADD CONSTRAINT "FK_documents_uploaded_by"
          FOREIGN KEY ("uploaded_by") REFERENCES "subscriber_users"("id") ON DELETE SET NULL;
        END IF;
      END$$;
    `);

    // Add foreign key constraint for updated_by if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_documents_updated_by'
        ) THEN
          ALTER TABLE "documents"
          ADD CONSTRAINT "FK_documents_updated_by"
          FOREIGN KEY ("updated_by") REFERENCES "subscriber_users"("id") ON DELETE SET NULL;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "FK_documents_updated_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "FK_documents_uploaded_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "metadata"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "updated_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "uploaded_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "section"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "category"`);
  }
}