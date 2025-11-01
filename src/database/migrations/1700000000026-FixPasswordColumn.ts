import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPasswordColumn1700000000026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if password column exists
    const passwordExists = await queryRunner.hasColumn('subscriber_users', 'password');
    const passwordHashExists = await queryRunner.hasColumn('subscriber_users', 'password_hash');

    console.log('Password column exists:', passwordExists);
    console.log('Password_hash column exists:', passwordHashExists);

    if (passwordExists && passwordHashExists) {
      // Both columns exist, drop the old password column
      await queryRunner.query(`ALTER TABLE subscriber_users DROP COLUMN password`);
    } else if (passwordExists && !passwordHashExists) {
      // Only password exists, rename it to password_hash
      await queryRunner.query(`ALTER TABLE subscriber_users RENAME COLUMN password TO password_hash`);
    } else if (!passwordExists && !passwordHashExists) {
      // Neither exists, create password_hash column
      await queryRunner.query(`ALTER TABLE subscriber_users ADD COLUMN password_hash VARCHAR(255) NOT NULL`);
    }
    // If only password_hash exists, we're good to go

    // Ensure password_hash is NOT NULL
    await queryRunner.query(`ALTER TABLE subscriber_users ALTER COLUMN password_hash SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename back to password for rollback
    const passwordHashExists = await queryRunner.hasColumn('subscriber_users', 'password_hash');
    if (passwordHashExists) {
      await queryRunner.query(`ALTER TABLE subscriber_users RENAME COLUMN password_hash TO password`);
    }
  }
}