# Product Requirements Document (PRD)
# AI Readiness Assessment Platform

**Version:** 1.0  
**Author:** Daniel Anderson, ShiftF5 Consulting  
**Date:** January 2026  
**Status:** Ready for Development

---

## 1. Executive Summary

### 1.1 Purpose
Build a multi-tenant SaaS platform that enables consultants to deploy AI readiness surveys to client organisations, collect anonymous employee responses, and generate executive-ready reports with insights, visualisations, and an AI-powered chatbot for data interrogation.

### 1.2 Problem Statement
Organisations investing in AI (particularly Microsoft Copilot) lack a structured way to assess their workforce's current AI adoption, identify opportunities for productivity gains, surface concerns and barriers, and identify internal champions. Consultants need a repeatable, scalable tool to deliver this assessment as part of their AI enablement engagements.

### 1.3 Solution Overview
A web-based platform consisting of:
1. **Survey Application** - Anonymous, branded surveys deployed per client
2. **Admin Dashboard** - Client management, configuration, and response monitoring
3. **Report Generator** - Automated executive reports with AI Readiness Scores
4. **AI Chatbot** - Natural language interface for interrogating survey data

### 1.4 Success Metrics
- Survey completion rate > 70%
- Report generation time < 3 minutes
- Executive satisfaction with report quality
- Reusability across multiple client engagements

---

## 2. User Personas

### 2.1 Consultant (Primary User)
- Deploys surveys to client organisations
- Configures client branding and options
- Reviews responses and generates reports
- Uses chatbot to explore data and answer executive questions
- Presents findings to client leadership

### 2.2 Survey Respondent (Employee)
- Receives survey link from their organisation
- Completes anonymous survey on desktop or mobile
- Wants clear, quick experience (< 10 minutes)

### 2.3 Client Executive (Report Consumer)
- Receives executive report and presentation
- Wants clear scores, benchmarks, and actionable insights
- May ask follow-up questions that consultant answers via chatbot

---

## 3. Functional Requirements

### 3.1 Survey Application

#### 3.1.1 Survey Flow
| Requirement | Description | Priority |
|-------------|-------------|----------|
| SR-001 | Display welcome screen with client logo and survey introduction | Must |
| SR-002 | Show progress indicator (percentage or step X of Y) throughout survey | Must |
| SR-003 | Present questions one section at a time with clear section headers | Must |
| SR-004 | Support all question types: single select, multi-select (with limits), scale (1-5), open text | Must |
| SR-005 | Validate required fields before allowing progression | Must |
| SR-006 | Display confirmation screen upon submission with thank you message | Must |
| SR-007 | Track completion time (start to submit) | Should |
| SR-008 | Allow save and resume via browser local storage | Could |

#### 3.1.2 Survey Questions
The survey consists of 35 questions across 8 sections. Each question maps to a specific database field and contributes to scoring calculations.

**Section 1: About You** (5 questions)
*Purpose: Segmentation and prioritisation analysis*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 1 | What is your role level? | Single select | Individual Contributor / Team Lead / Manager / Senior Manager / Director / Executive | role_level |
| 2 | Which department do you work in? | Single select | [Configurable per client] | department |
| 3 | How long have you been with the organisation? | Single select | Less than 1 year / 1-3 years / 3-5 years / 5+ years | tenure |
| 4 | Do you manage direct reports? | Single select | Yes / No | has_direct_reports |
| 5 | Which location/office are you based in? | Single select | [Configurable per client] | location |

**Section 2: Current AI Adoption** (4 questions)
*Purpose: Establishes baseline adoption and awareness*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 6 | How would you rate your current familiarity with AI tools (e.g., Copilot, ChatGPT, Gemini)? | Scale 1-5 | 1 = No familiarity → 5 = Very confident user | ai_familiarity |
| 7 | How frequently do you use AI tools for work-related tasks? | Single select | Never / Rarely (monthly) / Sometimes (weekly) / Often (daily) / Constantly (multiple times daily) | ai_usage_frequency |
| 8 | Which AI tools, if any, are you currently using for work? | Multi-select | Microsoft Copilot / ChatGPT / Google Gemini / Claude / Other / None | ai_tools_used |
| 9 | Is your use of AI tools supported by your organisation, or are you using them independently? | Single select | Officially supported / Informally tolerated / Using independently / Unsure | ai_usage_support |

**Section 3: Time & Productivity** (6 questions)
*Purpose: Quantifies opportunity for executive business case*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 10 | How many hours per week do you estimate you spend on administrative tasks (emails, scheduling, status updates, filing)? | Single select | 0-2 hours / 2-5 hours / 5-10 hours / 10-15 hours / 15+ hours | admin_task_hours |
| 11 | How many hours per week do you spend searching for information or documents? | Single select | 0-2 hours / 2-5 hours / 5-10 hours / 10+ hours | searching_info_hours |
| 12 | How many hours per week do you spend in meetings? | Single select | 0-5 hours / 5-10 hours / 10-15 hours / 15-20 hours / 20+ hours | meeting_hours |
| 13 | How much of your meeting time is spent on status updates or information sharing (versus decision-making or collaboration)? | Single select | 0-25% / 25-50% / 50-75% / 75-100% | meeting_status_percent |
| 14 | How many hours per week do you spend creating or formatting documents, presentations, or reports? | Single select | 0-2 hours / 2-5 hours / 5-10 hours / 10+ hours | document_creation_hours |
| 15 | If AI could save you 5 hours per week, what would you reinvest that time into? | Single select | Higher-value work / Strategic thinking / Customer engagement / Learning & development / Personal wellbeing / Other | time_savings_reinvestment |

**Section 4: Workflows & Pain Points** (4 questions)
*Purpose: Identifies high-impact use cases*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 16 | What are the most repetitive or time-consuming tasks in your role? | Multi-select (max 3) | Writing/responding to emails / Summarising information / Creating reports or presentations / Searching for documents / Data entry or formatting / Meeting preparation / Taking notes or writing minutes / Status updates / Other | repetitive_tasks |
| 17 | Which of these tasks do you believe could be improved or assisted by AI? | Multi-select | [Same as Q16] | tasks_for_ai |
| 18 | How often do you struggle to find information you need to do your job? | Single select | Never / Rarely / Sometimes / Often / Constantly | info_finding_struggle |
| 19 | Rate your agreement: "I spend too much time on low-value tasks that take me away from more important work." | Scale 1-5 | 1 = Strongly disagree → 5 = Strongly agree | low_value_tasks_agreement |

**Section 5: Tools & Data** (4 questions)
*Purpose: Assesses Microsoft 365 baseline and data landscape*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 20 | Which Microsoft 365 applications do you use daily? | Multi-select | Outlook / Teams / Word / Excel / PowerPoint / SharePoint / OneDrive / OneNote / Planner / Other | m365_apps_used |
| 21 | Where do you primarily store and access work documents? | Single select | SharePoint / OneDrive / Teams / Shared network drives / Email attachments / Local desktop / Other | document_storage |
| 22 | How confident are you that you can find the latest version of a document when you need it? | Scale 1-5 | 1 = Not confident → 5 = Very confident | document_confidence |
| 23 | Are you aware of AI features (such as Copilot) already available in Microsoft 365? | Single select | Yes, I use them / Yes, but I haven't tried them / Vaguely aware / Not aware | copilot_awareness |

**Section 6: Concerns & Barriers** (4 questions)
*Purpose: Surfaces risk, governance gaps, and resistance*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 24 | What concerns, if any, do you have about using AI in your work? | Multi-select | Accuracy/reliability of AI outputs / Data privacy and security / Job security / Lack of training or guidance / Don't trust AI / Don't see the value / No concerns / Other | ai_concerns |
| 25 | What is currently stopping you from using AI tools more often? | Multi-select | Don't know how / No access to tools / Not sure what's approved / Don't have time to learn / Don't see how it applies to my role / Nothing - I use them regularly / Other | adoption_barriers |
| 26 | Do you work with sensitive or confidential information that you would be hesitant to use with AI tools? | Single select | Yes, frequently / Yes, occasionally / Rarely / No | sensitive_data_frequency |
| 27 | Rate your agreement: "I understand what data is appropriate to use with AI tools and what isn't." | Scale 1-5 | 1 = Strongly disagree → 5 = Strongly agree | data_appropriateness_agreement |

**Section 7: Change Readiness** (4 questions)
*Purpose: Predicts adoption curve and training needs*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 28 | How would you describe your attitude toward adopting new technologies? | Single select | I prefer to wait until others have tried it / I adopt once it's proven / I'm an early adopter / I actively seek out new tools | tech_adoption_attitude |
| 29 | Rate your agreement: "I am confident I could learn to use AI tools effectively with the right training." | Scale 1-5 | 1 = Strongly disagree → 5 = Strongly agree | learning_confidence |
| 30 | How do you prefer to learn new technology skills? | Single select | Self-paced online learning / Live workshops or training / One-on-one coaching / Learning from colleagues / Written guides or documentation | preferred_learning_method |
| 31 | How supported do you feel by your organisation when it comes to learning new tools? | Scale 1-5 | 1 = Not supported → 5 = Very supported | org_support_rating |

**Section 8: Opportunity & Ideas** (4 questions)
*Purpose: Captures frontline innovation and identifies champions*

| Q# | Question | Type | Options | DB Field |
|----|----------|------|---------|----------|
| 32 | If AI could help you with one thing in your job, what would it be? | Open text | - | ai_wish_open_text |
| 33 | Do you have any ideas for how AI could benefit your team, department, or the organisation? | Open text | - | ai_ideas_open_text |
| 34 | How interested are you in being more involved in AI adoption within your team or organisation? | Single select | Not interested / Somewhat interested / Very interested / I want to lead or champion this | ai_involvement_interest |
| 35 | Would you be willing to participate in an AI pilot program or provide ongoing feedback? | Single select | Yes / Maybe / No | pilot_participation |

#### 3.1.3 Survey UI Requirements
| Requirement | Description | Priority |
|-------------|-------------|----------|
| SR-009 | Mobile-responsive design (works on phone, tablet, desktop) | Must |
| SR-010 | Client branding: logo, primary colour, secondary colour | Must |
| SR-011 | Clean, professional aesthetic suitable for enterprise | Must |
| SR-012 | Accessible (WCAG 2.1 AA compliance) | Should |
| SR-013 | Fast load times (< 2 seconds initial load) | Must |
| SR-014 | Works offline after initial load (PWA) | Could |

---

### 3.2 Admin Dashboard

#### 3.2.1 Client Management
| Requirement | Description | Priority |
|-------------|-------------|----------|
| AD-001 | Create new client with name and URL slug | Must |
| AD-002 | Configure client branding (upload logo, set colours) | Must |
| AD-003 | Configure department list for client | Must |
| AD-004 | Configure location list for client | Must |
| AD-005 | Set survey status (draft / active / closed) | Must |
| AD-006 | Generate and display unique survey URL | Must |
| AD-007 | Copy survey URL to clipboard | Must |
| AD-008 | Delete client and all associated data | Should |

#### 3.2.2 Response Monitoring
| Requirement | Description | Priority |
|-------------|-------------|----------|
| AD-009 | Display total response count per client | Must |
| AD-010 | Display response count over time (chart) | Should |
| AD-011 | Display completion rate by department | Should |
| AD-012 | Real-time updates (polling or websocket) | Could |

#### 3.2.3 Data Export
| Requirement | Description | Priority |
|-------------|-------------|----------|
| AD-013 | Export all responses to CSV | Must |
| AD-014 | Export all responses to Excel (.xlsx) | Should |
| AD-015 | Filter export by date range | Could |

#### 3.2.4 Admin Authentication
| Requirement | Description | Priority |
|-------------|-------------|----------|
| AD-016 | Email/password login via Supabase Auth | Must |
| AD-017 | Password reset flow | Must |
| AD-018 | Role-based access (admin / consultant) | Should |
| AD-019 | Restrict consultant access to assigned clients only | Should |

---

### 3.3 Executive Report Generation

#### 3.3.1 Report Sections

**Section 1: Executive Summary**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-001 | Display overall AI Readiness Score (0-100) with visual gauge | Must |
| RP-002 | Display 6 sub-scores with visual indicators | Must |
| RP-003 | Generate 3-5 key findings bullet points | Must |
| RP-004 | Highlight top 3 opportunities | Must |
| RP-005 | Highlight top 3 concerns/barriers | Must |
| RP-006 | Display response count and completion context | Must |

**Section 2: Current State Analysis**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-007 | AI familiarity distribution chart (bar/pie) | Must |
| RP-008 | Current AI tool usage breakdown chart | Must |
| RP-009 | Sanctioned vs unsanctioned AI use chart | Must |
| RP-010 | M365 application adoption chart | Must |
| RP-011 | Copilot awareness breakdown | Should |

**Section 3: Opportunity & ROI Potential**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-012 | Total estimated admin hours per week (aggregated) | Must |
| RP-013 | Total hours spent searching for information | Must |
| RP-014 | Meeting time analysis with status update percentage | Must |
| RP-015 | Top tasks identified as AI-improvable (ranked bar chart) | Must |
| RP-016 | Projected time savings calculation | Must |
| RP-017 | Time reinvestment preferences breakdown | Should |

**Section 4: Risk & Governance**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-018 | Top concerns ranked chart | Must |
| RP-019 | Barriers to adoption ranked chart | Must |
| RP-020 | Sensitive data handling awareness breakdown | Must |
| RP-021 | Data appropriateness understanding score | Must |
| RP-022 | Shadow AI risk indicator (based on unsanctioned use) | Should |

**Section 5: Change Readiness**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-023 | Technology adoption attitude distribution | Must |
| RP-024 | Training confidence level distribution | Must |
| RP-025 | Preferred learning methods chart | Must |
| RP-026 | Organisational support perception score | Must |

**Section 6: Champions & Next Steps**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-027 | Count of potential AI champions (Q34 = "Very interested" or "I want to lead") | Must |
| RP-028 | Pilot program interest breakdown | Must |
| RP-029 | AI-summarised themes from open-text responses (Q32, Q33) | Must |
| RP-030 | Recommended next steps based on scores | Should |

**Section 7: Segmented Analysis**
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-031 | Readiness score breakdown by department | Must |
| RP-032 | Readiness score breakdown by role level | Must |
| RP-033 | Readiness score breakdown by location | Should |
| RP-034 | Comparison heatmap visualisation | Could |

#### 3.3.2 Scoring Methodology

**Overall AI Readiness Score (0-100)**

| Factor | Weight | Source Questions | Calculation Logic |
|--------|--------|------------------|-------------------|
| Current Adoption | 20% | Q6, Q7, Q8, Q9 | Average of: AI familiarity (Q6 × 20), usage frequency mapped to 0-100, tool diversity score, official support indicator |
| Opportunity Scale | 25% | Q10, Q11, Q12, Q14, Q19 | Higher hours = higher opportunity; Q19 agreement indicates pain point awareness |
| Tool Foundation | 15% | Q20, Q21, Q22, Q23 | M365 breadth, modern storage (SharePoint/OneDrive/Teams), document confidence, Copilot awareness |
| Risk Awareness | 15% | Q26, Q27 | Balanced: some sensitivity awareness is good, but combined with understanding of appropriate use |
| Change Readiness | 15% | Q28, Q29, Q31 | Early adopter attitude, learning confidence, org support perception |
| Champion Availability | 10% | Q34, Q35 | Interest in involvement, pilot participation willingness |

**Sub-score Calculations:**
Each factor produces a sub-score (0-100) using weighted averages of normalised question responses.

**Score Interpretation:**
| Score Range | Interpretation |
|-------------|----------------|
| 0-25 | Early Stage - Significant foundation work required |
| 26-50 | Developing - Ready for targeted pilots |
| 51-75 | Advancing - Ready for broader rollout |
| 76-100 | Leading - Optimise and scale |

#### 3.3.3 Report Output
| Requirement | Description | Priority |
|-------------|-------------|----------|
| RP-035 | Display report in web interface with all sections | Must |
| RP-036 | Export report to PDF | Must |
| RP-037 | Export individual charts as PNG | Should |
| RP-038 | Generate report on-demand (button click) | Must |
| RP-039 | Cache generated report in database | Should |
| RP-040 | Regenerate report when new responses received | Should |

---

### 3.4 AI Chatbot

#### 3.4.1 Functionality
| Requirement | Description | Priority |
|-------------|-------------|----------|
| CB-001 | Natural language interface for querying survey data | Must |
| CB-002 | Answer questions about response distributions | Must |
| CB-003 | Answer questions about specific segments (department, role, location) | Must |
| CB-004 | Calculate and present aggregated metrics on request | Must |
| CB-005 | Summarise open-text responses on request | Must |
| CB-006 | Identify AI champions by name/department | Must |
| CB-007 | Compare segments (e.g., "How does Sales compare to Marketing?") | Should |
| CB-008 | Generate charts/visualisations on request | Should |
| CB-009 | Maintain conversation context for follow-up questions | Must |
| CB-010 | Cite response counts when presenting data | Must |

#### 3.4.2 Example Queries
The chatbot should handle queries such as:
- "Which department has the lowest AI familiarity?"
- "How many hours per week could we save if we addressed document search issues?"
- "Who are the potential AI champions in the Sales team?"
- "What are the top 3 concerns from managers?"
- "Show me the difference in AI adoption between Sydney and Melbourne offices"
- "Summarise the open-text responses about AI ideas"
- "What percentage of employees use AI tools without official support?"
- "Which tasks do people most want AI help with?"

#### 3.4.3 Technical Implementation
| Requirement | Description | Priority |
|-------------|-------------|----------|
| CB-011 | Use Anthropic Claude API for natural language processing | Must |
| CB-012 | Pass relevant survey data as context to Claude | Must |
| CB-013 | Store conversation history per session | Should |
| CB-014 | Rate limit API calls to manage costs | Should |

---

## 4. Non-Functional Requirements

### 4.1 Performance
| Requirement | Description | Target |
|-------------|-------------|--------|
| NF-001 | Survey page load time | < 2 seconds |
| NF-002 | Survey submission response time | < 1 second |
| NF-003 | Report generation time | < 30 seconds |
| NF-004 | Chatbot response time | < 5 seconds |
| NF-005 | Admin dashboard load time | < 3 seconds |

### 4.2 Scalability
| Requirement | Description | Target |
|-------------|-------------|--------|
| NF-006 | Concurrent survey respondents | 500+ |
| NF-007 | Total responses per client | 10,000+ |
| NF-008 | Total clients supported | 100+ |

### 4.3 Security
| Requirement | Description | Priority |
|-------------|-------------|----------|
| NF-009 | No PII collected in survey responses | Must |
| NF-010 | HTTPS for all connections | Must |
| NF-011 | Supabase Row Level Security for data isolation | Must |
| NF-012 | Rate limiting on survey submissions | Should |
| NF-013 | Admin authentication required for dashboard | Must |
| NF-014 | API keys stored as environment variables | Must |

### 4.4 Availability
| Requirement | Description | Target |
|-------------|-------------|--------|
| NF-015 | Uptime | 99.5% |
| NF-016 | Backup frequency | Daily (Supabase managed) |

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | Next.js 14 (App Router) | React-based, SSR, API routes, Vercel deployment |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| UI Components | shadcn/ui | Accessible, customisable components |
| Database | Supabase (PostgreSQL) | Managed Postgres, Auth, Storage, RLS |
| Authentication | Supabase Auth | Built-in, secure, easy integration |
| File Storage | Supabase Storage | Logos, PDF reports, chart exports |
| Charts | Recharts | React-native, customisable, exportable |
| PDF Generation | @react-pdf/renderer or Puppeteer | Server-side PDF generation |
| AI/LLM | Anthropic Claude API | Natural language processing for chatbot |
| Deployment | Vercel | Seamless Next.js deployment, edge functions |

### 5.2 Database Schema

#### 5.2.1 clients
```sql
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
```

#### 5.2.2 responses
```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completion_time_seconds INTEGER,
  
  -- Section 1: About You
  role_level TEXT,
  department TEXT,
  tenure TEXT,
  has_direct_reports BOOLEAN,
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

CREATE INDEX idx_responses_client_id ON responses(client_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX idx_responses_client_department ON responses(client_id, department);
CREATE INDEX idx_responses_client_role ON responses(client_id, role_level);
```

#### 5.2.3 reports
```sql
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
```

#### 5.2.4 admin_users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'consultant' CHECK (role IN ('admin', 'consultant')),
  client_access UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

#### 5.2.5 chat_sessions & chat_messages
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  charts_generated TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
```

#### 5.2.6 Row Level Security
```sql
-- Enable RLS
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

CREATE POLICY "Admins can read responses" ON responses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read reports" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add granular client_access policies as needed
```

#### 5.2.7 Storage Buckets
```
logos/     -- Client logo uploads (public read)
reports/   -- Generated PDF reports (authenticated read)
charts/    -- Exported chart images (authenticated read)
```

### 5.3 Application Structure

```
/app
  /survey/[slug]          -- Public survey pages
    /page.tsx             -- Survey form
    /complete/page.tsx    -- Confirmation page
  /admin
    /layout.tsx           -- Admin layout with auth check
    /page.tsx             -- Dashboard home
    /clients
      /page.tsx           -- Client list
      /new/page.tsx       -- Create client
      /[id]/page.tsx      -- Client detail & config
    /reports
      /[clientId]/page.tsx -- Report view & generation
    /chat
      /[clientId]/page.tsx -- Chatbot interface
    /settings/page.tsx    -- Admin settings
  /api
    /survey/submit        -- POST survey response
    /reports/generate     -- POST generate report
    /chat                 -- POST chatbot message
    /export/csv           -- GET export responses
/components
  /survey                 -- Survey form components
  /admin                  -- Admin dashboard components
  /charts                 -- Reusable chart components
  /ui                     -- shadcn/ui components
/lib
  /supabase               -- Supabase client & helpers
  /scoring                -- Score calculation logic
  /utils                  -- Utility functions
```

### 5.4 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## 6. User Interface Specifications

### 6.1 Survey Interface

**Welcome Screen:**
- Client logo (centered, max 200px width)
- Survey title: "AI Readiness Assessment"
- Brief introduction (2-3 sentences)
- Estimated completion time: "~8-10 minutes"
- "Begin Survey" button (primary colour)

**Question Screen:**
- Section header with number and title
- Progress bar at top (percentage complete)
- Question text (large, readable)
- Response options (radio buttons, checkboxes, or text input)
- "Back" and "Next" buttons
- Section transitions with brief purpose statement

**Confirmation Screen:**
- Checkmark icon
- "Thank you for completing the survey"
- "Your responses have been recorded"
- Optional: "You may now close this window"

### 6.2 Admin Dashboard

**Navigation:**
- Sidebar with: Dashboard, Clients, Reports, Chat, Settings
- Top bar with: User name, Logout

**Client List:**
- Table with: Client Name, Status, Responses, Created Date, Actions
- "New Client" button
- Status badges (Draft = grey, Active = green, Closed = red)

**Client Detail:**
- Tabs: Configuration, Responses, Report
- Configuration: Logo upload, colour pickers, department/location lists
- Responses: Count, chart over time, export button
- Report: Generate button, view report, download PDF

**Report View:**
- Sticky header with client name and scores
- Scrollable sections with charts
- Print/PDF button
- Last generated timestamp

**Chatbot:**
- Full-height chat interface
- Message input at bottom
- Conversation history with timestamps
- "New Conversation" button
- Client selector dropdown

### 6.3 Design System

**Colours:**
- Primary: Configurable per client (default #3B82F6)
- Secondary: Configurable per client (default #1E40AF)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Neutral: #6B7280

**Typography:**
- Font: Inter (Google Fonts)
- Headings: Bold, sizes 24px-36px
- Body: Regular, 16px
- Small: Regular, 14px

**Components:**
- Use shadcn/ui for consistency
- Buttons: Rounded, hover states
- Cards: White background, subtle shadow
- Charts: Consistent colour palette

---

## 7. API Specifications

### 7.1 Survey Submission
```
POST /api/survey/submit
Body: { clientId, responses: {...} }
Response: { success: true, responseId }
```

### 7.2 Report Generation
```
POST /api/reports/generate
Body: { clientId }
Response: { reportId, scores: {...}, sections: {...} }
Auth: Required
```

### 7.3 Chatbot
```
POST /api/chat
Body: { clientId, sessionId?, message }
Response: { sessionId, response, chartsGenerated?: [...] }
Auth: Required
```

### 7.4 Export
```
GET /api/export/csv?clientId={clientId}
Response: CSV file download
Auth: Required
```

---

## 8. Deployment & DevOps

### 8.1 Deployment Process
1. Push to GitHub main branch
2. Vercel auto-deploys from main
3. Environment variables configured in Vercel
4. Supabase migrations run manually or via CLI

### 8.2 Environments
| Environment | URL | Database |
|-------------|-----|----------|
| Production | ai-readiness.vercel.app | Supabase Production |
| Preview | [branch].vercel.app | Supabase Production (or staging) |
| Local | localhost:3000 | Supabase Local or Development |

---

## 9. Testing Requirements

### 9.1 Test Coverage
| Area | Type | Priority |
|------|------|----------|
| Survey submission | Integration | Must |
| Score calculation | Unit | Must |
| Report generation | Integration | Must |
| Authentication | Integration | Must |
| Chatbot responses | Integration | Should |

### 9.2 Test Scenarios
- Survey completes successfully on mobile
- Survey completes successfully on desktop
- All question types render and validate correctly
- Report generates with < 10 responses (edge case)
- Report generates with 500+ responses (load test)
- Chatbot handles ambiguous queries gracefully
- Export produces valid CSV with all columns

---

## 10. Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | Survey Application | Public-facing survey with all 35 questions |
| 2 | Admin Dashboard | Client management, response monitoring, export |
| 3 | Report Generator | Executive report with scores and visualisations |
| 4 | AI Chatbot | Natural language data interrogation |
| 5 | PDF Export | Downloadable executive report |
| 6 | Documentation | README with setup, deployment, and usage instructions |

---

## 11. Out of Scope (V1)

The following features are explicitly out of scope for the initial release:

- Industry benchmark comparisons
- Longitudinal tracking (repeat surveys over time)
- Microsoft Forms integration
- Automated email distribution and reminders
- SSO/SAML authentication
- Custom question builder
- Multi-language support
- White-label domain support
- API for third-party integrations

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low survey response rate | High | Medium | Clear communication, mobile-friendly, < 10 min completion |
| AI chatbot hallucination | Medium | Medium | Ground responses in actual data, cite counts |
| Report generation slow | Medium | Low | Cache calculations, optimise queries |
| Supabase rate limits | Low | Low | Implement client-side caching, batch operations |

---

## 13. Appendix

### 13.1 Glossary
| Term | Definition |
|------|------------|
| AI Readiness Score | Composite score (0-100) indicating organisation's preparedness for AI adoption |
| AI Operator | Internal champion who drives AI adoption within their team |
| Shadow AI | Unsanctioned use of AI tools by employees |
| Copilot | Microsoft's AI assistant integrated into Microsoft 365 |

### 13.2 References
- Brandon Gaddosi AI Consulting methodology (Playmakers AI podcast)
- Microsoft Copilot adoption framework
- Technology adoption lifecycle (Rogers)

---

**End of Document**
