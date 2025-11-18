import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndividualIdentityDocuments1700000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS individual_identity_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        individual_id UUID NOT NULL,
        id_type TEXT NOT NULL,
        issuing_country TEXT,
        issuing_authority TEXT,
        id_number TEXT,
        is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
        issue_date DATE,
        expiry_date DATE,
        document_id UUID,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_ind_id_docs_individual
          FOREIGN KEY (individual_id) REFERENCES individual_entities(id) ON DELETE CASCADE,
        CONSTRAINT fk_ind_id_docs_document
          FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ind_id_docs_individual_id ON individual_identity_documents (individual_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ind_id_docs_id_type ON individual_identity_documents (id_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ind_id_docs_expiry_date ON individual_identity_documents (expiry_date)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ind_id_docs_is_active ON individual_identity_documents (is_active)`,
    );

    // Drop legacy identity columns and indexes from individual_entities
    await queryRunner.query(`DROP INDEX IF EXISTS idx_individual_entities_id_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_individual_entities_id_expiry_date`);
    await queryRunner.query(`ALTER TABLE individual_entities DROP COLUMN IF EXISTS national_id`);
    await queryRunner.query(`ALTER TABLE individual_entities DROP COLUMN IF EXISTS id_type`);
    await queryRunner.query(`ALTER TABLE individual_entities DROP COLUMN IF EXISTS id_expiry_date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore legacy identity columns
    await queryRunner.query(`ALTER TABLE individual_entities ADD COLUMN IF NOT EXISTS national_id TEXT`);
    await queryRunner.query(`ALTER TABLE individual_entities ADD COLUMN IF NOT EXISTS id_type TEXT`);
    await queryRunner.query(`ALTER TABLE individual_entities ADD COLUMN IF NOT EXISTS id_expiry_date DATE`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_individual_entities_id_type ON individual_entities (id_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_individual_entities_id_expiry_date ON individual_entities (id_expiry_date)`,
    );

    // Drop the new identity documents table
    await queryRunner.query(`DROP TABLE IF EXISTS individual_identity_documents`);
  }
}