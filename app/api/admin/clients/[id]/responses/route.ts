import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params (Next.js 15+ requirement)
    const { id } = await params

    // Get all responses for this client using service role (bypasses RLS)
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('client_id', id)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Responses fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Responses API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
