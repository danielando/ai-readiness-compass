-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_colour TEXT DEFAULT '#3B82F6',
  secondary_colour TEXT DEFAULT '#1E40AF',
  departments TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  role_levels TEXT[] DEFAULT ARRAY[
    'Individual Contributor',
    'Team Lead',
    'Manager',
    'Senior Manager',
    'Director',
    'Executive'
  ],
  survey_status TEXT DEFAULT 'draft' CHECK (survey_status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completion_time_seconds INTEGER,

  -- Section 1: About You
  role_level TEXT,
  department TEXT,
  tenure TEXT,
  has_direct_reports TEXT,
  location TEXT,

  -- Section 2: Current AI Adoption
  ai_familiarity INTEGER CHECK (ai_familiarity BETWEEN 1 AND 5),
  ai_usage_frequency TEXT,
  ai_tools_used TEXT[],
  ai_usage_support TEXT,

  -- Section 3: Time & Productivity
  admin_task_hours TEXT,
  searching_info_hours TEXT,
  meeting_hours TEXT,
  meeting_status_percent TEXT,
  document_creation_hours TEXT,
  time_savings_reinvestment TEXT,

  -- Section 4: Workflows & Pain Points
  repetitive_tasks TEXT[],
  tasks_for_ai TEXT[],
  info_finding_struggle TEXT,
  low_value_tasks_agreement INTEGER CHECK (low_value_tasks_agreement BETWEEN 1 AND 5),

  -- Section 5: Tools & Data
  m365_apps_used TEXT[],
  document_storage TEXT,
  document_confidence INTEGER CHECK (document_confidence BETWEEN 1 AND 5),
  copilot_awareness TEXT,

  -- Section 6: Concerns & Barriers
  ai_concerns TEXT[],
  adoption_barriers TEXT[],
  sensitive_data_frequency TEXT,
  data_appropriateness_agreement INTEGER CHECK (data_appropriateness_agreement BETWEEN 1 AND 5),

  -- Section 7: Change Readiness
  tech_adoption_attitude TEXT,
  learning_confidence INTEGER CHECK (learning_confidence BETWEEN 1 AND 5),
  preferred_learning_method TEXT,
  org_support_rating INTEGER CHECK (org_support_rating BETWEEN 1 AND 5),

  -- Section 8: Opportunity & Ideas
  ai_wish_open_text TEXT,
  ai_ideas_open_text TEXT,
  ai_involvement_interest TEXT,
  pilot_participation TEXT
);

-- Create indexes
CREATE INDEX idx_responses_client_id ON responses(client_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX idx_responses_client_department ON responses(client_id, department);
CREATE INDEX idx_responses_client_role ON responses(client_id, role_level);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  response_count INTEGER,

  -- Scores (0-100)
  score_overall INTEGER,
  score_current_adoption INTEGER,
  score_opportunity_scale INTEGER,
  score_tool_foundation INTEGER,
  score_risk_awareness INTEGER,
  score_change_readiness INTEGER,
  score_champion_availability INTEGER,

  -- Aggregations
  total_admin_hours_per_week NUMERIC,
  total_search_hours_per_week NUMERIC,
  total_meeting_hours_per_week NUMERIC,
  potential_time_savings NUMERIC,
  champion_count INTEGER,
  pilot_interest_count INTEGER,

  -- Ranked results (JSONB)
  top_concerns JSONB,
  top_barriers JSONB,
  top_tasks_for_ai JSONB,

  -- AI-generated summaries
  ai_wish_themes TEXT[],
  ai_ideas_themes TEXT[],

  -- Segmented scores (JSONB)
  scores_by_department JSONB,
  scores_by_role_level JSONB,
  scores_by_location JSONB,

  report_pdf_url TEXT
);

CREATE INDEX idx_reports_client_generated ON reports(client_id, generated_at DESC);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'consultant' CHECK (role IN ('admin', 'consultant')),
  client_access UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  charts_generated TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public survey submission (no auth required)
CREATE POLICY "Anyone can submit responses" ON responses
  FOR INSERT WITH CHECK (true);

-- Authenticated admin access
CREATE POLICY "Admins can read clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert clients" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read responses" ON responses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read reports" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert reports" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert demo client
INSERT INTO clients (client_name, client_slug, primary_colour, secondary_colour, departments, locations, survey_status)
VALUES (
  'Demo Organization',
  'demo',
  '#3B82F6',
  '#1E40AF',
  ARRAY['Sales', 'Marketing', 'Engineering', 'Product', 'Operations', 'Finance', 'HR', 'IT', 'Other'],
  ARRAY['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Remote', 'Other'],
  'active'
);
