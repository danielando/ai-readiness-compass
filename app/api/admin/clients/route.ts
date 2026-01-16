import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get all clients using service role (bypasses RLS)
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Client fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      clientSlug,
      logoUrl,
      primaryColour,
      secondaryColour,
      departments,
      locations,
    } = body

    // Validate required fields
    if (!clientName || !clientSlug) {
      return NextResponse.json(
        { error: 'Client name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('client_slug', clientSlug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A client with this slug already exists. Please choose a different name.' },
        { status: 400 }
      )
    }

    // Create client using service role (bypasses RLS)
    const { data: client, error: insertError } = await supabaseAdmin
      .from('clients')
      .insert({
        client_name: clientName,
        client_slug: clientSlug,
        logo_url: logoUrl || null,
        primary_colour: primaryColour,
        secondary_colour: secondaryColour,
        departments,
        locations,
        survey_status: 'draft'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
