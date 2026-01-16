-- Migration 005: Enforce M365 Authentication for All Surveys
-- This migration makes M365 authentication mandatory for all surveys

-- Update the default value for require_m365_auth to true
ALTER TABLE clients
ALTER COLUMN require_m365_auth SET DEFAULT true;

-- Update all existing clients to require M365 auth
UPDATE clients
SET require_m365_auth = true
WHERE require_m365_auth = false;

-- Add constraint to ensure M365 auth is always enabled
ALTER TABLE clients
ADD CONSTRAINT clients_must_require_m365_auth CHECK (require_m365_auth = true);

-- Update comment for documentation
COMMENT ON COLUMN clients.require_m365_auth IS 'ALWAYS TRUE - All surveys require M365 authentication (system-wide policy)';

-- Add validation to ensure tenant IDs are configured
-- Note: This is a soft validation via comment, hard validation would be:
-- ALTER TABLE clients
-- ADD CONSTRAINT clients_must_have_tenant_ids CHECK (array_length(allowed_m365_tenant_ids, 1) > 0);
-- But we'll keep it flexible for now and validate in application code
