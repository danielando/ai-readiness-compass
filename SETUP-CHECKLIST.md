# 🚀 Setup Checklist - Domain-First M365 Authentication

## ✅ Step-by-Step Implementation Guide

### 📋 Part 1: Database Setup (5 minutes)

**1. Run Database Migrations in Supabase**

Go to your **Supabase Dashboard** → **SQL Editor** and run these migrations **in order**:

```sql
-- Migration 001: Initial schema (if not already done)
-- Copy and run: supabase/migrations/001_initial_schema.sql

-- Migration 002: Creative AI fields (if not already done)
-- Copy and run: supabase/migrations/002_add_creative_ai_fields.sql

-- Migration 003: Admin setup (if not already done)
-- Copy and run: supabase/migrations/003_admin_setup.sql

-- Migration 004: M365 authentication fields
-- Copy and run: supabase/migrations/004_add_m365_auth.sql

-- Migration 005: Enforce M365 auth (makes it mandatory)
-- Copy and run: supabase/migrations/005_enforce_m365_auth.sql

-- Migration 006: Domain-first authentication (NEW - RUN THIS)
-- Copy and run: supabase/migrations/006_domain_first_auth.sql
```

**How to run:**
1. Open file in your code editor
2. Copy entire contents
3. Go to Supabase Dashboard
4. SQL Editor → New Query
5. Paste → Run

---

### 🔐 Part 2: Azure App Registration (15 minutes - ONE TIME ONLY)

**This is a one-time setup that works for ALL your clients**

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Sign in with YOUR Microsoft account (not client's)

2. **Navigate to Microsoft Entra ID**
   - Search for "Microsoft Entra ID" or "Azure Active Directory"
   - Click on it

3. **Create App Registration**
   - Left sidebar → **App registrations**
   - Click **+ New registration**

   Fill in:
   - **Name**: `AI Readiness Survey Platform`
   - **Supported account types**:
     - ✅ Select **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"**
   - **Redirect URI**:
     - Platform: **Web**
     - URI: `http://localhost:3002/api/auth/callback/azure-ad`
   - Click **Register**

4. **Copy Application (client) ID**
   - You'll see "Application (client) ID" on the Overview page
   - Copy this (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - Save it somewhere - you'll need it for .env.local

5. **Create Client Secret**
   - Left sidebar → **Certificates & secrets**
   - Click **+ New client secret**
   - Description: `Survey App Secret`
   - Expires: **24 months**
   - Click **Add**
   - **⚠️ IMMEDIATELY COPY THE VALUE** - you can't see it again!
   - Save it somewhere secure

6. **Configure API Permissions**
   - Left sidebar → **API permissions**
   - Click **+ Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Search for and add these permissions:
     - ✅ `User.Read`
     - ✅ `email`
     - ✅ `profile`
     - ✅ `openid`
   - Click **Add permissions**
   - Click **✓ Grant admin consent for [Your Organization]**
   - Click **Yes** to confirm

---

### ⚙️ Part 3: Environment Variables (2 minutes)

**Update your `.env.local` file** in the project root:

```bash
# Existing Supabase config (keep these)
NEXT_PUBLIC_SUPABASE_URL=your-existing-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-existing-anon-key

# NEW: Microsoft 365 Authentication
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890  # From Step 4 above
AZURE_AD_CLIENT_SECRET=your-client-secret-value-here      # From Step 5 above
AZURE_AD_TENANT_ID=common                                  # Use "common" for multi-tenant

# NEW: NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=generate-this-below

# Optional: Anthropic API (for future chatbot)
ANTHROPIC_API_KEY=your-anthropic-key-if-you-have-one
```

**Generate NEXTAUTH_SECRET:**

Open a terminal and run:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

**⚠️ Important:** The `.env.local` file should NOT be committed to Git (it's already in .gitignore).

---

### 🔄 Part 4: Restart Dev Server (30 seconds)

The dev server needs to restart to pick up the new environment variables:

1. **Stop the current dev server:**
   - Go to your terminal where `npm run dev` is running
   - Press `Ctrl + C` to stop it

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Wait for it to compile:**
   - Should see: `✓ Ready in X.Xs`
   - Server will run on `http://localhost:3002`

---

### 👤 Part 5: Create Your Admin Account (5 minutes)

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** (or "Invite")
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box
4. Click **Send**
5. Copy the **UUID** of the created user

**Then promote to admin:**

In **Supabase SQL Editor**, run:
```sql
INSERT INTO admin_users (id, email, name, role, client_access)
VALUES (
  'YOUR-USER-UUID-HERE',      -- Replace with UUID from above
  'your-email@example.com',    -- Replace with your email
  'Your Name',                 -- Replace with your name
  'admin',                     -- Makes you an admin
  '{}'                         -- Admins see all clients
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', name = EXCLUDED.name;
```

---

### 🏢 Part 6: Configure Your First Client (3 minutes)

1. **Login to Admin Dashboard:**
   - Go to: http://localhost:3002/admin/login
   - Sign in with the email/password you created

2. **Create a New Client or Update Demo:**
   - Dashboard → Click on "Demo Organization" (or create new)
   - Click **"Authentication"** tab

3. **Configure Domain (THIS IS THE EASY PART!):**
   - Under "✅ REQUIRED: Allowed Email Domains"
   - Type the client's email domain (e.g., `acme.com`)
   - Click the **+** button
   - Click **"Save Changes"**

That's it! No need to ask for tenant IDs - they'll be auto-captured.

---

### 🧪 Part 7: Test the Survey (5 minutes)

1. **Get the Survey URL:**
   - From dashboard, note the client slug (e.g., `demo`)
   - Survey URL: `http://localhost:3002/survey/demo`

2. **Test Access:**
   - Open survey URL in a **new incognito/private window**
   - Should redirect to Microsoft sign-in
   - Sign in with a Microsoft account that has email `@acme.com`
   - Should be granted access and see the survey welcome screen

3. **Verify Auto-Capture:**
   - After first sign-in, go back to Admin Dashboard
   - Client → Authentication tab
   - Under "OPTIONAL: Tenant IDs"
   - You should see the tenant ID was automatically added!

---

## 📝 Summary of What You Just Set Up

✅ **Database:** Migrations applied, M365 auth enabled
✅ **Azure:** App registration created (works for all clients)
✅ **Environment:** Variables configured
✅ **Admin Account:** Created and promoted
✅ **First Client:** Domain configured
✅ **Testing:** Survey accessible via M365 login

---

## 🎯 For Each New Client

When you add a new client, all you need is:

1. Ask client: **"What's your company email domain?"**
2. Answer: "We use @company.com"
3. Admin Dashboard → Client → Authentication tab
4. Add `company.com` to Allowed Domains
5. Save
6. Done! ✨

No need to ask for:
- ❌ Tenant IDs
- ❌ Azure portal access
- ❌ IT admin involvement

The tenant ID is automatically captured when the first user signs in.

---

## 🐛 Troubleshooting

**Issue: "NEXTAUTH_SECRET is not set"**
- Solution: Make sure you generated and added NEXTAUTH_SECRET to .env.local
- Restart dev server after adding it

**Issue: "Redirect URI mismatch"**
- Solution: In Azure Portal → Your App → Authentication
- Add redirect URI: `http://localhost:3002/api/auth/callback/azure-ad`

**Issue: "Access Denied - Survey authentication not yet configured"**
- Solution: Make sure you added at least one domain in the Authentication tab

**Issue: "Only users with @X.com email addresses can access"**
- Solution: Sign in with an account that has an email from an allowed domain
- Or add more domains to the allowed list

---

## 📞 Next Steps

Once testing works locally:

1. **Deploy to Production** (Vercel/etc)
2. **Update Azure redirect URI** to production URL
3. **Update NEXTAUTH_URL** environment variable
4. **Start adding real clients** - just need their email domains!

---

**Total Setup Time: ~30 minutes (one-time)**
**Per-Client Setup Time: ~2 minutes** (just add their domain!)

You're ready to go! 🚀
