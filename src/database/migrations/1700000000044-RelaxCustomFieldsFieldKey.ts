import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelaxCustomFieldsFieldKey1700000000044 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ALTER COLUMN "field_key" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "entity_custom_fields" SET "field_key" = COALESCE("field_key", "field_name")`);
    await queryRunner.query(`ALTER TABLE "entity_custom_fields" ALTER COLUMN "field_key" SET NOT NULL`);
  }
}