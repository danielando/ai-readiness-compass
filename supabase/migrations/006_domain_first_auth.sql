-- Migration 006: Domain-First Authentication
-- Allow email domain-only validation, auto-capture tenant IDs

-- Remove the constraint that required M365 auth (we still enforce it, just removing the constraint)
ALTER TABLE clients
DROP CONSTRAINT IF EXISTS clients_must_require_m365_auth;

-- Update comment to reflect new domain-first approach
COMMENT ON COLUMN clients.allowed_m365_tenant_ids IS 'Auto-populated when users sign in. Can also be manually added for stricter validation.';
COMMENT ON COLUMN clients.allowed_m365_domains IS 'REQUIRED - Email domains allowed to access survey (e.g., company.com). Tenant IDs are auto-captured.';

-- Add auto_capture_tenant_ids flag
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS auto_capture_tenant_ids BOOLEAN DEFAULT true;

COMMENT ON COLUMN clients.auto_capture_tenant_ids IS 'If true, automatically add tenant IDs from valid domain sign-ins to allowed_m365_tenant_ids list';

-- Create function to auto-capture tenant IDs
CREATE OR REPLACE FUNCTION auto_capture_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If auto_capture is enabled and this is a new tenant ID for this client
  IF EXISTS (
    SELECT 1 FROM clients
    WHERE id = NEW.client_id
    AND auto_capture_tenant_ids = true
    AND NOT (NEW.m365_tenant_id = ANY(allowed_m365_tenant_ids))
  ) THEN
    -- Add the tenant ID to the allowed list
    UPDATE clients
    SET allowed_m365_tenant_ids = array_append(allowed_m365_tenant_ids, NEW.m365_tenant_id)
    WHERE id = NEW.client_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-capture tenant IDs when sessions are created
DROP TRIGGER IF EXISTS trigger_auto_capture_tenant_id ON survey_sessions;
CREATE TRIGGER trigger_auto_capture_tenant_id
  AFTER INSERT ON survey_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_capture_tenant_id();

-- Update demo client for domain-first approach
UPDATE clients
SET
  auto_capture_tenant_ids = true,
  allowed_m365_tenant_ids = '{}',  -- Start empty, will auto-populate
  allowed_m365_domains = '{}'  -- Admin needs to configure this
WHERE client_slug = 'demo';
