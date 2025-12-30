import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing columns to lists_management and list_values tables
 * to align with the entity definitions.
 */
export class AddMissingListsColumns1734652800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =====================================================
    // Add missing columns to lists_management table
    // =====================================================
    
    // First, drop the scope column if it exists and add status instead
    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS priority VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS is_system_list BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS is_readonly BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS auto_update BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS data_source VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS source_url VARCHAR(200);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS source_version VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS source_last_updated TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS sync_error TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS sync_retry_count INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS next_sync_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS sync_frequency_hours INTEGER;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS active_entries INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS inactive_entries INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS pending_entries INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS regulatory_framework VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS compliance_requirement VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS requires_enhanced_due_diligence BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS triggers_alert BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS blocks_transaction BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS alert_severity VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS action_required VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS matching_criteria JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS validation_rules JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS metadata JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS tags JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS approved_by UUID;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS approval_notes TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS retention_days INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS last_accessed_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE lists_management 
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    // Make created_by nullable for flexibility
    await queryRunner.query(`
      ALTER TABLE lists_management 
      ALTER COLUMN created_by DROP NOT NULL;
    `);

    // =====================================================
    // Add missing columns to list_values table
    // =====================================================
    
    // Rename value_name to value if it exists
    const valueNameExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'list_values' AND column_name = 'value_name';
    `);
    
    if (valueNameExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE list_values RENAME COLUMN value_name TO value;
      `);
    }

    // Check if value column exists, if not add it
    const valueExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'list_values' AND column_name = 'value';
    `);
    
    if (valueExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE list_values ADD COLUMN value VARCHAR(500);
      `);
    }

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS value_type VARCHAR(50) DEFAULT 'custom';
    `);

    // Rename value_code to normalized_value if it exists
    const valueCodeExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'list_values' AND column_name = 'value_code';
    `);
    
    if (valueCodeExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE list_values RENAME COLUMN value_code TO normalized_value;
      `);
    } else {
      await queryRunner.query(`
        ALTER TABLE list_values 
        ADD COLUMN IF NOT EXISTS normalized_value VARCHAR(500);
      `);
    }

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS match_type VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS match_threshold DECIMAL(5,2);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS is_false_positive BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS is_whitelisted BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS source VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS source_reference VARCHAR(200);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS source_version VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS source_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS verified_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS verified_by UUID;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS verification_notes TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS regulatory_framework VARCHAR(100);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS reason_for_listing VARCHAR(200);
    `);

    // Rename value_description to description if it exists
    const valueDescExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'list_values' AND column_name = 'value_description';
    `);
    
    if (valueDescExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE list_values RENAME COLUMN value_description TO description;
      `);
    } else {
      await queryRunner.query(`
        ALTER TABLE list_values 
        ADD COLUMN IF NOT EXISTS description TEXT;
      `);
    }

    // Rename value_metadata to additional_data if it exists
    const valueMetaExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'list_values' AND column_name = 'value_metadata';
    `);
    
    if (valueMetaExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE list_values RENAME COLUMN value_metadata TO additional_data;
      `);
    } else {
      await queryRunner.query(`
        ALTER TABLE list_values 
        ADD COLUMN IF NOT EXISTS additional_data JSONB;
      `);
    }

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS aliases JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS match_history JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS review_history JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS related_identifiers JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS metadata JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS tags JSONB;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS last_matched_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS match_count INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS last_reviewed_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS reviewed_by UUID;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS review_status VARCHAR(50);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS review_notes TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS review_frequency_days INTEGER;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS approved_by UUID;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS approval_notes TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS flagged_by UUID;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS flagged_date TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(200);
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS flag_notes TEXT;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE list_values 
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    // Make created_by nullable for flexibility
    await queryRunner.query(`
      ALTER TABLE list_values 
      ALTER COLUMN created_by DROP NOT NULL;
    `);

    console.log('Successfully added missing columns to lists_management and list_values tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration adds columns, reversing would require dropping them
    // which could cause data loss. Implement cautiously if needed.
    console.log('Down migration for AddMissingListsColumns not implemented to prevent data loss');
  }
}

// Quick fix: Run this SQL to make scope nullable
// ALTER TABLE lists_management ALTER COLUMN scope DROP NOT NULL;
