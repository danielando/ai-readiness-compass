import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Client slug is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: client, error } = await supabase
      .from('clients')
      .select('client_name, logo_url, primary_colour, secondary_colour')
      .eq('client_slug', slug)
      .single()

    if (error || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      client: {
        name: client.client_name,
        logo: client.logo_url,
        primaryColour: client.primary_colour,
        secondaryColour: client.secondary_colour,
      }
    })
  } catch (error) {
    console.error('Error fetching client info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
