import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get client using service role (bypasses RLS)
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !client) {
      console.error('Client fetch error:', error)
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      clientName,
      logoUrl,
      primaryColour,
      secondaryColour,
      departments,
      locations,
      surveyStatus,
      requireM365Auth,
      allowedTenantIds,
      allowedDomains,
    } = body

    // Update client using service role (bypasses RLS)
    const { data: client, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        client_name: clientName,
        logo_url: logoUrl || null,
        primary_colour: primaryColour,
        secondary_colour: secondaryColour,
        departments,
        locations,
        survey_status: surveyStatus,
        require_m365_auth: requireM365Auth,
        allowed_m365_tenant_ids: allowedTenantIds,
        allowed_m365_domains: allowedDomains,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
