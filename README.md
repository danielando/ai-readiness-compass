# Compass - AI Readiness Assessment Platform

A minimalist, Typeform-inspired survey application for assessing organizational AI readiness. Part of the ShiftF5 product suite.

**Live at**: [compass.shiftf5.co](https://compass.shiftf5.co)

Built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and Microsoft 365 authentication.

## Features

### ✨ Minimalist Survey Experience
- **One question per screen** with smooth transitions
- **Black & white design** with subtle gray tones
- **Full-screen immersive** layout with client branding
- **Progress tracking** with visual indicators
- **Keyboard navigation** (Enter to continue, arrows to navigate)
- **Auto-advance** on single-select questions
- **Save & resume** functionality using localStorage
- **Mobile-responsive** design

### 📊 Comprehensive Assessment
- **35 questions** across 8 sections
- **Multiple question types**: Single-select, multi-select, scale (1-5), open text
- **Anonymous responses** for honest feedback
- **Completion time tracking**

### 🎨 Customizable Branding
- Client logos
- Custom primary and secondary colors
- Configurable departments and locations

### 📈 Admin Dashboard (Coming Soon)
- Client management
- Real-time response monitoring
- Executive report generation with AI Readiness Scores
- Data visualization with charts
- CSV/Excel export
- AI chatbot for data interrogation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5 (Microsoft 365 SSO)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- A Supabase account

### 1. Clone and Install

```bash
cd "c:\Apps\AI Readiness"
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and keys
3. Run the migration script to create tables:
   - Go to Supabase Dashboard → SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL script

### 3. Configure Environment Variables

Create a `.env.local` file (already created, just update the values):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Anthropic API (for chatbot feature)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the home page.

Visit [http://localhost:3000/survey/demo](http://localhost:3000/survey/demo) to test the demo survey.

## Project Structure

```
c:\Apps\AI Readiness/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── survey/[slug]/            # Survey pages (TypeForm-styled)
│   │   └── page.tsx
│   └── api/                      # API routes
│       └── survey/submit/
│           └── route.ts
│
├── components/                   # React components
│   ├── survey/                   # Survey components
│   │   ├── welcome-screen.tsx
│   │   ├── question-card.tsx    # TypeForm-style questions
│   │   ├── progress-bar.tsx
│   │   └── completion-screen.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── progress.tsx
│
├── lib/                          # Utilities and config
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── types/                    # TypeScript types
│   │   └── survey.ts
│   ├── utils/
│   │   └── cn.ts                 # className utility
│   └── survey-data.ts            # Survey questions config
│
├── supabase/                     # Supabase configuration
│   └── migrations/
│       └── 001_initial_schema.sql
│
└── styles/                       # Global styles
    └── globals.css
```

## Survey Features

### Question Types

1. **Single Select**: Radio buttons with auto-advance
2. **Multi Select**: Checkboxes with max selection limits
3. **Scale (1-5)**: Visual scale selector
4. **Open Text**: Text input for detailed responses

### Sections

1. **About You** - Demographics and role information
2. **Current AI Adoption** - Baseline adoption and awareness
3. **Time & Productivity** - Quantifies opportunity
4. **Workflows & Pain Points** - Identifies high-impact use cases
5. **Tools & Data** - Microsoft 365 baseline
6. **Concerns & Barriers** - Risk and governance gaps
7. **Change Readiness** - Training needs and adoption curve
8. **Opportunity & Ideas** - Frontline innovation

### TypeForm-Style UX Features

- ✅ Full-screen question cards
- ✅ Smooth slide transitions
- ✅ Large, friendly typography
- ✅ Progress indicator
- ✅ Keyboard shortcuts
- ✅ Auto-advance on selection
- ✅ Mobile-optimized
- ✅ Branded welcome screen
- ✅ Animated completion screen

## Database Schema

### Main Tables

- **clients** - Client organizations and branding
- **responses** - Anonymous survey responses
- **reports** - Generated executive reports
- **admin_users** - Dashboard users
- **chat_sessions** - AI chatbot conversations
- **chat_messages** - Chat history

See `supabase/migrations/001_initial_schema.sql` for full schema.

## Development Roadmap

### ✅ Phase 1: Survey Application (COMPLETED)
- [x] TypeForm-styled UI
- [x] 35 questions across 8 sections
- [x] Progress tracking
- [x] Save & resume
- [x] API submission
- [x] Database schema

### ✅ Phase 2: Admin Dashboard (COMPLETED)
- [x] Authentication
- [x] Multi-tenant architecture
- [x] Client management
- [x] Custom segmentation (departments, locations)
- [x] Brand customization (logos, colors)
- [x] Access control (admin & consultant roles)
- [ ] Response monitoring UI
- [ ] Data export (CSV/Excel)

### 📋 Phase 3: Report Generation (PENDING)
- [ ] AI Readiness Score calculation
- [ ] Executive report with visualizations
- [ ] PDF export
- [ ] Segmented analysis

### 🤖 Phase 4: AI Chatbot (PENDING)
- [ ] Anthropic Claude integration
- [ ] Natural language queries
- [ ] Data interrogation
- [ ] Chart generation

## Testing the Survey

1. Visit `/survey/demo` to test the demo survey
2. Complete the survey to see the full TypeForm-style experience
3. Responses are saved to Supabase (if configured)
4. Progress is saved to localStorage for resume functionality

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

## Contributing

This is a proprietary project for ShiftF5 Consulting. For questions or support, contact the development team.

## License

Copyright © 2026 ShiftF5 Consulting. All rights reserved.

## Credits

- **Design Inspiration**: TypeForm
- **Built by**: Claude Code
- **Based on PRD by**: Daniel Anderson, ShiftF5 Consulting
