-- Migration: Create logs table
-- Run this SQL to create the logs table in your PostgreSQL database

-- Create severity enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_severity_enum') THEN
        CREATE TYPE log_severity_enum AS ENUM ('info', 'warning', 'error', 'critical');
    END IF;
END$$;

-- Create status enum type  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_status_enum') THEN
        CREATE TYPE log_status_enum AS ENUM ('success', 'failure', 'pending');
    END IF;
END$$;

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    subscriber_id UUID NOT NULL,
    user_id UUID,
    entity_id UUID,
    
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    
    severity log_severity_enum DEFAULT 'info',
    status log_status_enum DEFAULT 'success',
    
    metadata JSONB,
    request_data JSONB,
    response_data JSONB,
    
    ip_address INET,
    user_agent VARCHAR(500),
    session_id VARCHAR(255),
    correlation_id VARCHAR(255),
    
    duration_ms INTEGER,
    
    error_code VARCHAR(255),
    error_message TEXT,
    stack_trace TEXT,
    
    module VARCHAR(255),
    function_name VARCHAR(255),
    api_version VARCHAR(50),
    endpoint VARCHAR(255),
    http_method VARCHAR(10),
    http_status_code INTEGER,
    
    tags JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_subscriber_id ON logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_entity_id ON logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_logs_action_type ON logs(action_type);
CREATE INDEX IF NOT EXISTS idx_logs_severity ON logs(severity);
CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Add comments
COMMENT ON TABLE logs IS 'System audit and activity logs';
COMMENT ON COLUMN logs.subscriber_id IS 'Reference to the subscriber/tenant';
COMMENT ON COLUMN logs.user_id IS 'Reference to the user who performed the action';
COMMENT ON COLUMN logs.entity_id IS 'Reference to the entity affected by the action';
COMMENT ON COLUMN logs.correlation_id IS 'ID to track related log entries across a single request/transaction';
