import { NextResponse } from 'next/server'
import { isAdmin, getAdminUser } from '@/lib/admin-auth'

export async function GET() {
  try {
    const adminCheck = await isAdmin()
    const adminUser = await getAdminUser()

    if (!adminCheck || !adminUser) {
      return NextResponse.json(
        { isAdmin: false, reason: 'Not an admin user' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      isAdmin: true,
      user: adminUser,
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
