import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterIndividualIdentityDocumentsPhase31700000000028 implements MigrationInterface {
  name = 'AlterIndividualIdentityDocumentsPhase31700000000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "individual_identity_documents" ADD COLUMN "nationality" varchar(10)`);
    await queryRunner.query(`ALTER TABLE "individual_identity_documents" ADD COLUMN "created_by" uuid`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_iid_nationality" ON "individual_identity_documents" ("nationality")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_iid_created_by" ON "individual_identity_documents" ("created_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_iid_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_iid_nationality"`);

    await queryRunner.query(`ALTER TABLE "individual_identity_documents" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "individual_identity_documents" DROP COLUMN "nationality"`);
  }
}