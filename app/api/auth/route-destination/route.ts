import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { destination: '/', isAuthenticated: false },
        { status: 200 }
      )
    }

    // Check if user is admin
    const adminCheck = await isAdmin()
    if (adminCheck) {
      return NextResponse.json({
        destination: '/admin/dashboard',
        isAuthenticated: true,
        isAdmin: true,
      })
    }

    // For non-admin users, find their client survey based on email domain
    const userEmail = session.user.email
    const emailDomain = userEmail.split('@')[1]

    // Look up client by allowed domain
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('client_slug, survey_status')
      .contains('allowed_domains', [emailDomain])
      .eq('survey_status', 'active')
      .single()

    if (error || !client) {
      // No matching active survey found for this domain
      return NextResponse.json({
        destination: '/survey/auth/no-survey',
        isAuthenticated: true,
        isAdmin: false,
        error: 'No active survey found for your organization',
      })
    }

    // Route to their survey
    return NextResponse.json({
      destination: `/survey/${client.client_slug}`,
      isAuthenticated: true,
      isAdmin: false,
      clientSlug: client.client_slug,
    })
  } catch (error) {
    console.error('Route destination error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
