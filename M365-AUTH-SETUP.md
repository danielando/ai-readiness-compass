# Microsoft 365 Authentication Setup Guide

## 🔐 Overview

This guide explains how to set up Microsoft 365 (Entra ID/Azure AD) authentication for your AI Readiness surveys. This ensures only employees from approved organizations can access their survey.

## 🎯 Key Benefits

**Security:**
- ✅ Only approved M365 tenants can access surveys
- ✅ Validate users belong to client organization
- ✅ Prevent unauthorized access
- ✅ Track which employees completed the survey

**Data Quality:**
- ✅ No duplicate responses (one per email)
- ✅ Link responses to departments/roles
- ✅ Follow up with specific employees
- ✅ Export authenticated response data

**Compliance:**
- ✅ Meet enterprise security requirements
- ✅ Audit trail of survey access
- ✅ GDPR-compliant data collection

---

## 📋 Prerequisites

1. **Client has Microsoft 365** (Business, Enterprise, or Education)
2. **Access to Azure Portal** (Global Admin or Application Admin role)
3. **Client's Tenant ID** (we'll show you how to find this)
4. **Client's primary domain** (e.g., `acme.com`)

---

## 🚀 Step-by-Step Setup

### Step 1: Create Microsoft Entra ID App Registration

This creates an "app" in the client's Microsoft tenant that allows their users to sign in to your survey.

#### 1.1: Go to Azure Portal

1. Visit [portal.azure.com](https://portal.azure.com)
2. Sign in with client's admin account (or have them do this)
3. Search for **"Microsoft Entra ID"** (formerly Azure Active Directory)
4. Click **App registrations** in the left menu

#### 1.2: Register New Application

1. Click **+ New registration**
2. Fill out the form:
   - **Name**: `AI Readiness Survey - [Client Name]`
   - **Supported account types**:
     - ✅ **Accounts in this organizational directory only (Single tenant)**
   - **Redirect URI**:
     - Platform: **Web**
     - URI: `https://your-domain.com/api/auth/callback/azure-ad`
     - For local dev: `http://localhost:3002/api/auth/callback/azure-ad`
3. Click **Register**

#### 1.3: Copy Important Values

After registration, you'll see the app overview. **Copy these values**:

1. **Application (client) ID**
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - You'll need this for `.env.local`

2. **Directory (tenant) ID**
   - Example: `12345678-90ab-cdef-1234-567890abcdef`
   - You'll add this to the client configuration

3. **Primary domain**
   - Example: `acme.com` or `acme.onmicrosoft.com`
   - Found under "Branding & properties"

#### 1.4: Create Client Secret

1. In the left menu, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `Survey App Secret`
4. Expires: **24 months** (recommended)
5. Click **Add**
6. **⚠️ IMPORTANT**: Copy the **Value** immediately (you can't see it again!)
   - Example: `a1B~2c3D4e5F6g7H8i9J0k~L1M2N3O4P5Q6R7S8`

#### 1.5: Configure API Permissions

1. In the left menu, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - ✅ `User.Read` (Read user profile)
   - ✅ `email` (Read user email)
   - ✅ `profile` (Read user profile)
   - ✅ `openid` (Sign in)
6. Click **Add permissions**
7. Click **✓ Grant admin consent for [Organization]** (requires admin)
8. Confirm by clicking **Yes**

---

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Microsoft 365 Authentication
AZURE_AD_CLIENT_ID=your-application-client-id-here
AZURE_AD_CLIENT_SECRET=your-client-secret-here
AZURE_AD_TENANT_ID=common  # Use "common" for multi-tenant, or specific tenant ID

# For multi-tenant support (multiple client organizations)
# Use "common" to allow any M365 tenant to authenticate
# Then validate against allowed_m365_tenant_ids in database

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-random-secret-here-generate-with-openssl
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### Step 3: Run Database Migration

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- File: supabase/migrations/004_add_m365_auth.sql
-- (Copy the entire contents of this file)
```

This adds:
- `require_m365_auth` - Enable/disable M365 auth per client
- `allowed_m365_tenant_ids` - Array of approved tenant IDs
- `allowed_m365_domains` - Array of approved email domains
- `survey_sessions` - Track authenticated users

---

### Step 4: Configure Client for M365 Auth

#### Option A: Via SQL (for existing clients)

```sql
-- Enable M365 auth for a specific client
UPDATE clients
SET
  require_m365_auth = true,
  allowed_m365_tenant_ids = ARRAY['12345678-90ab-cdef-1234-567890abcdef'],
  allowed_m365_domains = ARRAY['acme.com', 'acme.onmicrosoft.com']
WHERE client_slug = 'acme-corporation';
```

#### Option B: Via Admin Dashboard (after UI update)

1. Go to `/admin/clients/[id]`
2. Navigate to **Authentication** tab
3. Toggle **Require Microsoft 365 Authentication**
4. Add **Tenant ID**: `12345678-90ab-cdef-1234-567890abcdef`
5. Add **Allowed Domains**: `acme.com`
6. Click **Save Changes**

---

### Step 5: Test Authentication

1. **As a survey respondent**:
   - Visit `http://localhost:3002/survey/acme-corporation`
   - Click **"Sign in with Microsoft"**
   - Sign in with M365 account (`user@acme.com`)
   - Grant consent if prompted
   - Should redirect to survey welcome screen

2. **Verify in database**:
   ```sql
   SELECT * FROM survey_sessions
   WHERE client_id = (SELECT id FROM clients WHERE client_slug = 'acme-corporation');
   ```

3. **Check session tracking**:
   - User email should be stored
   - Tenant ID should match allowed list
   - Session should be created

---

## 🔍 How Tenant Validation Works

### Flow Diagram

```
User visits survey URL
    ↓
Check if client requires M365 auth
    ↓ (Yes)
Redirect to Microsoft login
    ↓
User authenticates with M365
    ↓
Microsoft returns token with:
  - Email: user@acme.com
  - Tenant ID: 12345678-...
  - Name: John Doe
    ↓
Validate tenant ID against allowed_m365_tenant_ids
    ↓ (Match found)
Validate domain against allowed_m365_domains
    ↓ (Match found)
Create survey_session
    ↓
Allow access to survey
```

### Validation Rules

**Tenant ID Validation:**
```javascript
// Token contains: tid = "12345678-90ab-cdef-1234-567890abcdef"
// Client config: allowed_m365_tenant_ids = ["12345678-90ab-cdef-1234-567890abcdef"]
// Result: ✅ PASS (exact match)
```

**Domain Validation:**
```javascript
// Token contains: email = "john.doe@acme.com"
// Client config: allowed_m365_domains = ["acme.com"]
// Result: ✅ PASS (domain matches)

// Token contains: email = "external@gmail.com"
// Result: ❌ FAIL (domain not allowed)
```

---

## 🎨 Survey Access Modes

### Mode 1: Anonymous (Default)
- **Config**: `require_m365_auth = false`
- **Access**: Anyone with URL
- **Tracking**: No user identification
- **Use case**: Public surveys, external stakeholders

### Mode 2: M365 Required (Single Tenant)
- **Config**: `require_m365_auth = true`
- **Allowed tenants**: `['tenant-id-1']`
- **Access**: Only users from specified tenant
- **Tracking**: Full user identification
- **Use case**: Corporate internal surveys

### Mode 3: M365 Optional (Hybrid)
- **Config**: `require_m365_auth = false`
- **Allowed tenants**: `['tenant-id-1']`
- **Access**: Anyone, but M365 users get identified
- **Tracking**: Partial (identified if logged in)
- **Use case**: Mixed audience surveys

---

## 🏢 Multi-Tenant Scenarios

### Scenario 1: Single Organization

**Client**: Acme Corporation
**Tenants**: 1 (Acme's M365)
**Config**:
```sql
allowed_m365_tenant_ids = ARRAY['acme-tenant-id']
allowed_m365_domains = ARRAY['acme.com']
```

### Scenario 2: Parent Company + Subsidiaries

**Client**: Global Holdings Inc
**Tenants**: 3 (Parent + 2 subsidiaries)
**Config**:
```sql
allowed_m365_tenant_ids = ARRAY[
  'parent-tenant-id',
  'subsidiary-1-tenant-id',
  'subsidiary-2-tenant-id'
]
allowed_m365_domains = ARRAY[
  'globalholdings.com',
  'subsidiary1.com',
  'subsidiary2.com'
]
```

### Scenario 3: Merged Organizations

**Client**: MergedCorp (recently merged)
**Tenants**: 2 (legacy tenants not yet consolidated)
**Config**:
```sql
allowed_m365_tenant_ids = ARRAY[
  'company-a-tenant-id',
  'company-b-tenant-id'
]
allowed_m365_domains = ARRAY[
  'companya.com',
  'companyb.com',
  'mergedcorp.com'
]
```

---

## 🛡️ Security Best Practices

### 1. Keep Client Secrets Secure
- ❌ Never commit to Git
- ✅ Store in `.env.local` (gitignored)
- ✅ Use different secrets for dev/prod
- ✅ Rotate secrets every 6-12 months

### 2. Validate Tenant IDs Server-Side
- ❌ Never trust client-side validation
- ✅ Always check `tid` claim in JWT token
- ✅ Validate against database allowed list
- ✅ Log unauthorized access attempts

### 3. Monitor Session Activity
```sql
-- Check for suspicious activity
SELECT
  user_email,
  m365_tenant_id,
  COUNT(*) as access_count,
  MIN(started_at) as first_access,
  MAX(last_active_at) as last_access
FROM survey_sessions
GROUP BY user_email, m365_tenant_id
HAVING COUNT(*) > 1
ORDER BY access_count DESC;
```

### 4. Set Appropriate Token Expiry
- Survey sessions: **24 hours** (default)
- Admin sessions: **8 hours**
- Refresh tokens: **30 days**

---

## 🐛 Troubleshooting

### Issue: "Tenant not allowed" error

**Cause**: User's M365 tenant ID not in `allowed_m365_tenant_ids`

**Solution**:
1. Get user's tenant ID from error logs
2. Verify it matches client's actual tenant
3. Add to allowed list:
   ```sql
   UPDATE clients
   SET allowed_m365_tenant_ids =
     array_append(allowed_m365_tenant_ids, 'correct-tenant-id')
   WHERE client_slug = 'client-name';
   ```

### Issue: "Domain not allowed" error

**Cause**: User's email domain not in `allowed_m365_domains`

**Solution**:
```sql
UPDATE clients
SET allowed_m365_domains =
  array_append(allowed_m365_domains, 'newdomain.com')
WHERE client_slug = 'client-name';
```

### Issue: "AADSTS50011: Redirect URI mismatch"

**Cause**: Callback URL in Azure doesn't match your app

**Solution**:
1. Go to Azure Portal → App Registration
2. Navigate to **Authentication**
3. Add redirect URI: `http://localhost:3002/api/auth/callback/azure-ad`
4. For production: `https://your-domain.com/api/auth/callback/azure-ad`

### Issue: Users see consent screen every time

**Cause**: Admin consent not granted

**Solution**:
1. Azure Portal → App Registration → API Permissions
2. Click **Grant admin consent for [Org]**
3. Confirm

---

## 📊 Data Privacy & GDPR

### What Data is Collected

**Authenticated Surveys Collect:**
- ✅ Email address (for deduplication)
- ✅ Display name (optional, for follow-up)
- ✅ Tenant ID (for validation)
- ✅ Object ID (Microsoft's user ID)
- ❌ Password (never stored)
- ❌ Personal data beyond email/name

### GDPR Compliance

**Right to Access:**
```sql
SELECT * FROM survey_sessions
WHERE user_email = 'user@company.com';
```

**Right to be Forgotten:**
```sql
-- Delete user's survey session
DELETE FROM survey_sessions
WHERE user_email = 'user@company.com';

-- Anonymize their response
UPDATE responses
SET authenticated_user_email = NULL
WHERE authenticated_user_email = 'user@company.com';
```

---

## 🚀 Production Deployment

### 1. Update Redirect URIs in Azure

Add production URL:
```
https://survey.yourcompany.com/api/auth/callback/azure-ad
```

### 2. Update Environment Variables

In your production host (Vercel/etc):
```bash
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=common
NEXTAUTH_URL=https://survey.yourcompany.com
NEXTAUTH_SECRET=production-secret-here
```

### 3. Enable HTTPS Only

In Azure Portal → App Registration → Authentication:
- ✅ Enable "Access tokens"
- ✅ Enable "ID tokens"
- ❌ Disable "Allow public client flows"

---

## 📞 Next Steps

1. ✅ Complete Step 1: Create Entra ID app registration
2. ✅ Complete Step 2: Configure environment variables
3. ✅ Complete Step 3: Run database migration
4. ✅ Complete Step 4: Configure client for M365 auth
5. ✅ Complete Step 5: Test authentication
6. ✅ Deploy to production
7. ✅ Share survey URL with client

---

**Questions?** Contact your development team or refer to:
- Microsoft Entra ID documentation: [learn.microsoft.com/entra](https://learn.microsoft.com/entra)
- NextAuth.js Azure AD provider: [next-auth.js.org](https://next-auth.js.org)
