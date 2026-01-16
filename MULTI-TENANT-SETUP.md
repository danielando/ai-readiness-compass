# Multi-Tenant Setup Guide

## 🏢 Overview

Your AI Readiness platform now supports **multi-tenant** architecture, allowing you to manage surveys for multiple client organizations from a single admin portal.

## 🔑 Key Features

### For Admins (You)
- ✅ Full access to all client organizations
- ✅ Create new clients with custom branding
- ✅ Manage departments and locations per client
- ✅ View all responses across all clients
- ✅ Generate reports for any client

### For Consultants (Team Members)
- ✅ Access only to assigned clients
- ✅ View and manage specific client surveys
- ✅ Generate reports for assigned clients
- ✅ No access to other clients' data

### For Survey Respondents (Anonymous)
- ✅ Access survey via unique URL: `/survey/[client-slug]`
- ✅ See client branding (logo, colors)
- ✅ Custom departments and locations
- ✅ Completely anonymous responses

---

## 📋 Setup Checklist

### 1️⃣ Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these migrations **in order**:

#### Migration 001 (Already completed)
```sql
-- This creates the base schema
-- File: supabase/migrations/001_initial_schema.sql
```

#### Migration 002 (Already completed)
```sql
-- This adds creative departments to demo client
-- File: supabase/migrations/002_add_creative_ai_fields.sql
```

#### Migration 003 (NEW - Run this now)
```sql
-- This adds enhanced RLS policies for multi-tenant access control
-- File: supabase/migrations/003_admin_setup.sql
```

Copy the contents of `supabase/migrations/003_admin_setup.sql` and run it in Supabase SQL Editor.

---

### 2️⃣ Create Your Admin Account

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** (manual signup)
3. Enter your email and a secure password
4. Copy the **UUID** of the newly created user

#### Option B: Via the Login Page

1. Go to `http://localhost:3001/admin/login`
2. You'll need to temporarily allow public signups in Supabase:
   - Dashboard → Authentication → Settings → Auth Providers
   - Enable "Email" provider and allow public signups
3. Create your account
4. **Important**: Disable public signups after creating your admin account!

---

### 3️⃣ Promote Yourself to Admin

In **Supabase SQL Editor**, run:

```sql
INSERT INTO admin_users (id, email, name, role, client_access)
VALUES (
  'YOUR-USER-UUID-HERE',  -- Replace with your auth.users UUID
  'your-email@example.com',  -- Replace with your email
  'Your Name',  -- Replace with your name
  'admin',
  '{}'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', name = EXCLUDED.name;
```

Replace:
- `YOUR-USER-UUID-HERE` with the UUID from Step 2
- `your-email@example.com` with your actual email
- `Your Name` with your name

---

### 4️⃣ Login and Test

1. Go to `http://localhost:3001/admin/login`
2. Login with your email and password
3. You should see the **Admin Dashboard** with the demo client

---

## 🎨 Creating New Clients

### Via Admin Dashboard

1. Login to `/admin/login`
2. Click **+ New Client** in the top right
3. Fill out the form:
   - **Client Name**: The organization's name (e.g., "Acme Corporation")
   - **Survey URL Slug**: Auto-generated from name (e.g., "acme-corporation")
   - **Logo URL**: Optional URL to the client's logo
   - **Brand Colors**: Primary and secondary colors for the survey
   - **Departments**: Customize the list of departments
   - **Locations**: Customize the list of locations
4. Click **Create Client**

### Survey URL Structure

Each client gets a unique survey URL:
```
/survey/[client-slug]
```

For example:
- Demo: `/survey/demo`
- Acme Corp: `/survey/acme-corporation`
- Tech Startup: `/survey/tech-startup`

---

## 👥 Managing Team Access

### Create Consultant Users

1. Create the user in **Supabase Auth** (Dashboard → Authentication → Users)
2. Get their user UUID
3. Run this SQL to grant them consultant access:

```sql
INSERT INTO admin_users (id, email, name, role, client_access)
VALUES (
  'CONSULTANT-UUID-HERE',
  'consultant@example.com',
  'Consultant Name',
  'consultant',
  ARRAY['client-uuid-1', 'client-uuid-2']
);
```

### Grant Access to Specific Clients

```sql
-- Grant access to specific clients by slug
UPDATE admin_users
SET client_access = ARRAY(
  SELECT id FROM clients
  WHERE client_slug IN ('acme-corporation', 'tech-startup')
)
WHERE email = 'consultant@example.com';
```

### Remove Access

```sql
-- Remove all client access
UPDATE admin_users
SET client_access = '{}'
WHERE email = 'consultant@example.com';
```

---

## 🎯 Client Management

### Change Survey Status

Each client has a survey status:
- **Draft**: Survey is hidden, respondents cannot access it
- **Active**: Survey is live and accepting responses
- **Closed**: Survey is visible but not accepting new responses

Change status in the client management page (`/admin/clients/[id]`)

### Customize Per-Client Settings

Each client can have unique:
- **Branding**: Logo, primary color, secondary color
- **Departments**: Customize to match their org structure
- **Locations**: Add offices, cities, or regions
- **Role Levels**: (Currently standardized, customization coming soon)

---

## 📊 Data Segmentation

### By Department
Responses are segmented by department for each client. This allows reports like:
- "40% of Marketing uses ChatGPT"
- "Engineering has low creative AI adoption"

### By Location
Track adoption across offices or regions:
- "Sydney office: 60% AI usage"
- "Remote workers: 80% AI usage"

### By Role Level
Understand adoption by seniority:
- "Executives: 90% familiarity"
- "Individual Contributors: 50% familiarity"

---

## 🔒 Security & Access Control

### Row Level Security (RLS)

The database uses **Postgres Row Level Security** to enforce access:

**Admins:**
- Can see ALL clients, responses, and reports
- Can create new clients
- Can manage all settings

**Consultants:**
- Can ONLY see clients in their `client_access` array
- Can view responses for assigned clients
- Can generate reports for assigned clients
- Cannot see other consultants' clients

**Public (Survey Respondents):**
- Can submit responses to ANY client survey
- Cannot read any data
- Completely anonymous

### Best Practices

1. **Never share admin credentials** - Create consultant accounts for team members
2. **Use strong passwords** - Enable 2FA in Supabase if possible
3. **Review client_access regularly** - Remove consultants who leave
4. **Keep survey URLs private** - Only share with intended respondents

---

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Configuration

1. **Disable public signups** in production:
   - Dashboard → Authentication → Settings
   - Disable "Enable email signup"
   - Manually create admin accounts via SQL

2. **Enable email confirmations**:
   - Dashboard → Authentication → Settings → Email Auth
   - Enable "Enable email confirmations"

3. **Set password requirements**:
   - Dashboard → Authentication → Settings → Password
   - Minimum length: 12 characters

### Custom Domain

Set up a custom domain for your admin portal:
- Production: `admin.yourcompany.com`
- Survey URLs: `survey.yourcompany.com/[client-slug]`

---

## 📈 Usage Examples

### Example 1: Corporate Client

**Client Name**: Global Tech Inc
**Slug**: `global-tech`
**Departments**: Engineering, Product, Sales, Marketing, HR
**Locations**: San Francisco, New York, London, Singapore
**Status**: Active

Survey URL: `/survey/global-tech`

### Example 2: Small Business

**Client Name**: Local Coffee Shop
**Slug**: `local-coffee`
**Departments**: Front of House, Kitchen, Management
**Locations**: Downtown Store, Airport Store
**Status**: Draft

Survey URL: `/survey/local-coffee` (not yet accessible)

---

## 🐛 Troubleshooting

### Issue: "Client not found" when accessing survey

**Solution**: Check that `survey_status = 'active'` in the clients table.

### Issue: Admin user cannot see any clients

**Solution**: Verify the user's role is set to `'admin'` in the admin_users table:
```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

### Issue: Consultant cannot see assigned clients

**Solution**: Check the `client_access` array:
```sql
SELECT client_access FROM admin_users WHERE email = 'consultant@example.com';
```

Verify the UUIDs match actual client IDs:
```sql
SELECT id, client_slug FROM clients;
```

### Issue: Cannot create new clients

**Solution**: Ensure you're logged in as an admin:
```sql
UPDATE admin_users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📞 Next Steps

1. ✅ Run migration 003
2. ✅ Create your admin account
3. ✅ Login to `/admin/login`
4. ✅ Create your first real client
5. ✅ Set the client to "Active"
6. ✅ Share the survey URL with respondents
7. ✅ Collect responses
8. ✅ Generate reports (coming soon)

---

**Questions?** Check the code comments in:
- `app/admin/dashboard/page.tsx` - Main admin interface
- `app/admin/clients/new/page.tsx` - Client creation
- `app/admin/clients/[id]/page.tsx` - Client management
- `supabase/migrations/003_admin_setup.sql` - RLS policies
