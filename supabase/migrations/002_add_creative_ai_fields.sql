-- Migration 002: Add creative departments and update AI tools
-- This migration adds new creative-focused departments and removes the separate creative_ai_tools_used field
-- since we merged it into the ai_tools_used field in Question 8

-- Note: No schema changes needed - ai_tools_used already exists as TEXT[]
-- The ai_tools_used field now includes both productivity and creative AI tools

-- Update demo client to include new departments
UPDATE clients
SET departments = ARRAY[
  'Sales',
  'Marketing',
  'Creative/Design',
  'Content/Communications',
  'Engineering',
  'Product',
  'Operations',
  'Finance',
  'HR',
  'Learning & Development',
  'Customer Success/Support',
  'IT',
  'Other'
]
WHERE client_slug = 'demo';
