import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixLogsTableSchema1732566700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if 'timestamp' column exists and rename it to 'created_at'
    const hasTimestamp = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'timestamp'
    `);
    
    if (hasTimestamp.length > 0) {
      await queryRunner.query(`ALTER TABLE logs RENAME COLUMN "timestamp" TO "created_at"`);
    }

    // Add 'created_at' if it doesn't exist
    const hasCreatedAt = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'created_at'
    `);
    
    if (hasCreatedAt.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW()`);
    }

    // Add 'updated_at' if it doesn't exist
    const hasUpdatedAt = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'updated_at'
    `);
    
    if (hasUpdatedAt.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW()`);
    }

    // Add 'deleted_at' if it doesn't exist
    const hasDeletedAt = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'deleted_at'
    `);
    
    if (hasDeletedAt.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "deleted_at" TIMESTAMP`);
    }

    // Add 'is_active' if it doesn't exist
    const hasIsActive = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'is_active'
    `);
    
    if (hasIsActive.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "is_active" BOOLEAN DEFAULT true`);
    }

    // Rename 'action_description' to 'description' if it exists
    const hasActionDescription = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'action_description'
    `);
    
    if (hasActionDescription.length > 0) {
      await queryRunner.query(`ALTER TABLE logs RENAME COLUMN "action_description" TO "description"`);
    }

    // Add 'description' if it doesn't exist
    const hasDescription = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'description'
    `);
    
    if (hasDescription.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "description" TEXT NOT NULL DEFAULT ''`);
    }

    // Add 'severity' enum column if not exists or update type
    const hasSeverity = await queryRunner.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'severity'
    `);
    
    // Create severity enum type if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'logs_severity_enum') THEN
          CREATE TYPE logs_severity_enum AS ENUM ('info', 'warning', 'error', 'critical');
        END IF;
      END$$;
    `);

    if (hasSeverity.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "severity" logs_severity_enum DEFAULT 'info'`);
    } else if (hasSeverity[0].data_type === 'text') {
      // Convert text to enum
      await queryRunner.query(`
        ALTER TABLE logs 
        ALTER COLUMN severity TYPE logs_severity_enum 
        USING CASE 
          WHEN severity IN ('info', 'warning', 'error', 'critical') THEN severity::logs_severity_enum 
          ELSE 'info'::logs_severity_enum 
        END
      `);
    }

    // Add 'status' enum column if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'logs_status_enum') THEN
          CREATE TYPE logs_status_enum AS ENUM ('success', 'failure', 'pending');
        END IF;
      END$$;
    `);

    const hasStatus = await queryRunner.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'status'
    `);

    if (hasStatus.length === 0) {
      await queryRunner.query(`ALTER TABLE logs ADD COLUMN "status" logs_status_enum DEFAULT 'success'`);
    } else if (hasStatus[0].data_type === 'text') {
      await queryRunner.query(`
        ALTER TABLE logs 
        ALTER COLUMN status TYPE logs_status_enum 
        USING CASE 
          WHEN status IN ('success', 'failure', 'pending') THEN status::logs_status_enum 
          ELSE 'success'::logs_status_enum 
        END
      `);
    }

    // Add missing columns expected by the entity
    const columnsToAdd = [
      { name: 'metadata', type: 'JSONB' },
      { name: 'correlation_id', type: 'VARCHAR(255)' },
      { name: 'duration_ms', type: 'INTEGER' },
      { name: 'error_code', type: 'VARCHAR(255)' },
      { name: 'stack_trace', type: 'TEXT' },
      { name: 'module', type: 'VARCHAR(255)' },
      { name: 'function_name', type: 'VARCHAR(255)' },
      { name: 'api_version', type: 'VARCHAR(50)' },
      { name: 'endpoint', type: 'VARCHAR(255)' },
      { name: 'http_method', type: 'VARCHAR(10)' },
      { name: 'http_status_code', type: 'INTEGER' },
      { name: 'tags', type: 'JSONB' },
    ];

    for (const col of columnsToAdd) {
      const hasCol = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'logs' AND column_name = '${col.name}'
      `);
      
      if (hasCol.length === 0) {
        await queryRunner.query(`ALTER TABLE logs ADD COLUMN "${col.name}" ${col.type}`);
      }
    }

    // Update entity_id column to be UUID type if it's TEXT
    const entityIdType = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'logs' AND column_name = 'entity_id'
    `);

    if (entityIdType.length > 0 && entityIdType[0].data_type === 'text') {
      // First drop any existing foreign key constraint
      await queryRunner.query(`
        ALTER TABLE logs DROP CONSTRAINT IF EXISTS fk_logs_entity
      `);
      
      // Change column type
      await queryRunner.query(`
        ALTER TABLE logs 
        ALTER COLUMN entity_id TYPE UUID USING NULLIF(entity_id, '')::UUID
      `);
    }

    // Create index on created_at if not exists (drop old timestamp index first)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_logs_timestamp`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename created_at back to timestamp
    await queryRunner.query(`ALTER TABLE logs RENAME COLUMN "created_at" TO "timestamp"`);
    
    // Drop added columns
    const columnsToDrop = [
      'updated_at', 'deleted_at', 'is_active', 'metadata', 'correlation_id',
      'duration_ms', 'error_code', 'stack_trace', 'module', 'function_name',
      'api_version', 'endpoint', 'http_method', 'http_status_code', 'tags'
    ];
    
    for (const col of columnsToDrop) {
      await queryRunner.query(`ALTER TABLE logs DROP COLUMN IF EXISTS "${col}"`);
    }
    
    // Recreate timestamp index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_logs_created_at`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp)`);
  }
}
