-- Migration: Alter logs table to add missing columns
-- This migration adds columns required by the LogEntity to the existing logs table

-- Add missing base columns
ALTER TABLE logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Copy existing timestamp data to created_at
UPDATE logs SET created_at = "timestamp" WHERE created_at IS NULL;

-- Add missing log-specific columns
ALTER TABLE logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS error_code VARCHAR(255);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS stack_trace TEXT;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS module VARCHAR(255);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS function_name VARCHAR(255);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS api_version VARCHAR(50);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS endpoint VARCHAR(255);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS http_method VARCHAR(10);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS http_status_code INTEGER;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS tags JSONB;

-- Copy action_description to description if description is null
UPDATE logs SET description = action_description WHERE description IS NULL AND action_description IS NOT NULL;

-- Ensure description has a default if still null
UPDATE logs SET description = '' WHERE description IS NULL;

-- Change entity_id column type from text to uuid if needed (may fail if data exists)
-- ALTER TABLE logs ALTER COLUMN entity_id TYPE uuid USING entity_id::uuid;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Done
SELECT 'Migration completed successfully' as result;
