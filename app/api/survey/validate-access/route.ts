import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { clientSlug } = await request.json()

    if (!clientSlug) {
      return NextResponse.json(
        { error: 'Client slug is required' },
        { status: 400 }
      )
    }

    // Check if user is an admin first (before client lookup)
    const userIsAdmin = await isAdmin()
    const session = await auth()

    // Get client configuration using service role to bypass RLS
    // Admins can access any status, regular users need 'active'
    let client
    let clientError

    if (userIsAdmin && session?.user) {
      // Admin: fetch client regardless of status
      const result = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('client_slug', clientSlug)
        .single()
      client = result.data
      clientError = result.error
    } else {
      // Regular user: only fetch active surveys
      const result = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('client_slug', clientSlug)
        .eq('survey_status', 'active')
        .single()
      client = result.data
      clientError = result.error
    }

    if (clientError || !client) {
      console.error(`Client lookup failed for slug "${clientSlug}":`, clientError)
      return NextResponse.json(
        {
          allowed: false,
          error: 'Survey not found or not active',
          reason: 'Survey not found or not active. Please check that the survey exists and is set to "active" status.'
        },
        { status: 404 }
      )
    }

    console.log(`Client found: ${client.client_name} (${client.id}), Status: ${client.survey_status}`)

    if (userIsAdmin && session?.user) {
      // Admin users can access any survey (even draft/closed)
      console.log('Admin access granted for M365 user:', session.user.email)
      return NextResponse.json({
        allowed: true,
        requiresAuth: false,
        isAdmin: true,
        surveyStatus: client.survey_status,
        user: {
          email: session.user.email,
          name: session.user.name,
        },
        client: {
          id: client.id,
          name: client.client_name,
          logo: client.logo_url,
        }
      })
    }

    // If M365 auth is not required, allow access
    if (!client.require_m365_auth) {
      return NextResponse.json({
        allowed: true,
        requiresAuth: false,
        client: {
          id: client.id,
          name: client.client_name,
          logo: client.logo_url,
        }
      })
    }

    // M365 auth is required - check session (already fetched above for admin check)
    // const session = await auth() // Already called above

    if (!session || !session.user) {
      return NextResponse.json({
        allowed: false,
        requiresAuth: true,
        reason: 'Authentication required',
        client: {
          id: client.id,
          name: client.client_name,
          logo: client.logo_url,
        }
      })
    }

    // Validate tenant ID
    const userTenantId = (session.user as any).tenantId
    const userEmail = session.user.email
    const userObjectId = (session.user as any).objectId

    if (!userTenantId) {
      return NextResponse.json({
        allowed: false,
        requiresAuth: true,
        reason: 'No tenant ID found in session',
      }, { status: 403 })
    }

    // DOMAIN-FIRST VALIDATION APPROACH
    // Primary validation: Email domain (easier to obtain from clients)
    const allowedDomains = client.allowed_m365_domains || []

    if (allowedDomains.length === 0) {
      console.error(`No allowed domains configured for client ${clientSlug}`)
      return NextResponse.json({
        allowed: false,
        requiresAuth: true,
        reason: 'Survey authentication not yet configured. Please contact the administrator.',
      }, { status: 403 })
    }

    if (userEmail) {
      const emailDomain = userEmail.split('@')[1]?.toLowerCase()
      const allowedDomainsLower = allowedDomains.map((d: string) => d.toLowerCase())

      if (!allowedDomainsLower.includes(emailDomain)) {
        console.error(`Domain ${emailDomain} not allowed for client ${clientSlug}. Allowed: ${allowedDomains.join(', ')}`)
        return NextResponse.json({
          allowed: false,
          requiresAuth: true,
          reason: `Only users with @${allowedDomains.join(' or @')} email addresses can access this survey.`,
        }, { status: 403 })
      }
    } else {
      return NextResponse.json({
        allowed: false,
        requiresAuth: true,
        reason: 'No email address found in your Microsoft account.',
      }, { status: 403 })
    }

    // Secondary validation: Tenant ID (if manually configured for stricter control)
    // If tenant IDs are configured, validate against them
    // If empty (domain-only mode), tenant will be auto-captured on session creation
    const allowedTenants = client.allowed_m365_tenant_ids || []
    if (allowedTenants.length > 0 && !allowedTenants.includes(userTenantId)) {
      console.error(`Tenant ${userTenantId} not in allowed list for client ${clientSlug}`)
      return NextResponse.json({
        allowed: false,
        requiresAuth: true,
        reason: 'Your Microsoft 365 organization is not authorized to access this survey.',
      }, { status: 403 })
    }

    // Create or update survey session
    const supabase = createClient()
    const { data: existingSession } = await supabase
      .from('survey_sessions')
      .select('*')
      .eq('client_id', client.id)
      .eq('user_email', userEmail)
      .single()

    if (existingSession) {
      // Update last active
      await supabase
        .from('survey_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existingSession.id)
    } else {
      // Create new session
      await supabase
        .from('survey_sessions')
        .insert({
          client_id: client.id,
          user_email: userEmail,
          user_name: session.user.name || null,
          m365_tenant_id: userTenantId,
          m365_object_id: userObjectId,
        })
    }

    return NextResponse.json({
      allowed: true,
      requiresAuth: true,
      authenticated: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        tenantId: userTenantId,
      },
      client: {
        id: client.id,
        name: client.client_name,
        logo: client.logo_url,
      }
    })

  } catch (error) {
    console.error('Error validating survey access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
