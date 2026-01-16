-- Migration 004: Add Microsoft 365 Authentication Support
-- This migration adds fields to support M365 SSO with tenant restrictions

-- Add M365 authentication fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS require_m365_auth BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allowed_m365_tenant_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allowed_m365_domains TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN clients.require_m365_auth IS 'If true, survey requires M365 authentication from allowed tenants';
COMMENT ON COLUMN clients.allowed_m365_tenant_ids IS 'Array of Microsoft Entra ID (Azure AD) tenant IDs allowed to access this survey';
COMMENT ON COLUMN clients.allowed_m365_domains IS 'Array of email domains allowed (e.g., company.com) - validated against M365 token';

-- Create survey_sessions table to track authenticated survey respondents
CREATE TABLE IF NOT EXISTS survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  m365_tenant_id TEXT,
  m365_object_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  response_id UUID REFERENCES responses(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_survey_sessions_client ON survey_sessions(client_id);
CREATE INDEX idx_survey_sessions_email ON survey_sessions(user_email);
CREATE INDEX idx_survey_sessions_tenant ON survey_sessions(m365_tenant_id);

-- Add RLS policies for survey_sessions
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can view all sessions
CREATE POLICY "Admins can view all survey sessions" ON survey_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

-- Consultants can view sessions for assigned clients
CREATE POLICY "Consultants can view sessions for assigned clients" ON survey_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND survey_sessions.client_id = ANY(admin_users.client_access)
    )
  );

-- Add M365 auth metadata to responses table
ALTER TABLE responses
ADD COLUMN IF NOT EXISTS authenticated_user_email TEXT,
ADD COLUMN IF NOT EXISTS m365_tenant_id TEXT,
ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'anonymous';

-- Update demo client with optional M365 auth
UPDATE clients
SET
  require_m365_auth = false,
  allowed_m365_tenant_ids = '{}',
  allowed_m365_domains = '{}'
WHERE client_slug = 'demo';

-- Example: Enable M365 auth for a client (run this manually per client)
-- UPDATE clients
-- SET
--   require_m365_auth = true,
--   allowed_m365_tenant_ids = ARRAY['your-tenant-id-here'],
--   allowed_m365_domains = ARRAY['yourcompany.com']
-- WHERE client_slug = 'your-client-slug';
