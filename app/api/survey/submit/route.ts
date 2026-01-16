import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, responses, completionTime } = body

    // Get authenticated user session
    const session = await auth()
    const userEmail = session?.user?.email || null
    const userTenantId = (session?.user as any)?.tenantId || null

    // Get client ID from slug
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("client_slug", slug)
      .eq("survey_status", "active")
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Survey not found or not active" },
        { status: 404 }
      )
    }

    // Insert response with user information
    const { data: response, error: insertError } = await supabaseAdmin
      .from("responses")
      .insert({
        client_id: client.id,
        completion_time_seconds: completionTime,
        authenticated_user_email: userEmail,
        m365_tenant_id: userTenantId,
        auth_method: session ? 'm365' : 'anonymous',
        ...responses,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      responseId: response.id,
    })
  } catch (error) {
    console.error("Survey submission error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
