# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Upgrade Node.js (Required)

**Current version: 18.19.0 → Need: 20.9.0+**

Download and install from: [nodejs.org/en/download](https://nodejs.org/en/download)

Or use nvm:
```bash
nvm install 20.9.0
nvm use 20.9.0
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: AI Readiness
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes

### Step 3: Get API Keys

In your Supabase project:

1. Click ⚙️ **Settings** (bottom left)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key
   - **service_role** key (keep secret!)

### Step 4: Configure Environment

Open `.env.local` and paste your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=  # Leave blank for now
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Run Database Migration

1. In Supabase → Click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/migrations/001_initial_schema.sql` in this project
4. Copy ALL the SQL and paste into Supabase
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see: ✅ "Success. No rows returned"

### Step 6: Install & Run

```bash
cd "c:\Apps\AI Readiness"
npm install
npm run dev
```

### Step 7: Test!

Open in your browser:
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **Demo Survey**: [http://localhost:3000/survey/demo](http://localhost:3000/survey/demo)

---

## ✅ You Should See

### Homepage
- Welcome message
- "Admin Dashboard" and "View Demo Survey" buttons

### Demo Survey
- 🎨 Branded welcome screen
- 📊 Progress bar at top
- ❓ One question per screen
- ➡️ Smooth transitions
- ✅ Completion screen at end

---

## 🔍 Verify It's Working

1. **Complete the survey** at `/survey/demo`
2. **Check Supabase**:
   - Go to Supabase Dashboard
   - Click **Table Editor**
   - Select `responses` table
   - You should see your response! 🎉

---

## 🆘 Having Issues?

### "Node.js version required"
→ Upgrade Node.js to 20.9.0+ (Step 1)

### Survey doesn't load
→ Check browser console (F12) for errors
→ Make sure dev server is running (`npm run dev`)

### "Supabase client not configured"
→ Check `.env.local` has correct credentials
→ Restart dev server after changing `.env.local`

### Survey submission fails
→ Did you run the database migration? (Step 5)
→ Check Supabase Dashboard → Logs for errors

---

## 📚 Full Documentation

- **[README.md](README.md)** - Complete project overview
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Detailed setup instructions
- **[PROJECT-STATUS.md](PROJECT-STATUS.md)** - What's built & what's next
- **[ai-readiness-prd.md](ai-readiness-prd.md)** - Full product requirements

---

## 🎯 What You've Got

✅ TypeForm-styled survey application
✅ Beautiful, smooth animations
✅ Mobile-responsive design
✅ Save & resume functionality
✅ Anonymous data collection
✅ Production-ready codebase

---

## 🚀 What's Next?

Once you've tested the survey, you can:

1. **Customize branding** - Edit `app/survey/[slug]/page.tsx`
2. **Add more questions** - Edit `lib/survey-data.ts`
3. **Build admin dashboard** - Phase 2 (coming next)
4. **Deploy to production** - `vercel deploy`

---

**Enjoy your TypeForm-styled survey! 🎉**
