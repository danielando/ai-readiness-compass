import { auth } from "@/lib/auth"

// Admin email addresses - users with these emails have admin access
const ADMIN_EMAILS = [
  "daniel@danielanderson.com.au",
  // Add more admin emails here as needed
]

// Admin domains - any user from these domains has admin access
const ADMIN_DOMAINS = [
  "danielanderson.com.au",
  // Add more admin domains here as needed
]

export async function isAdmin(): Promise<boolean> {
  const session = await auth()

  if (!session?.user?.email) {
    return false
  }

  const email = session.user.email.toLowerCase()
  const domain = email.split('@')[1]

  // Check if email is in admin list
  if (ADMIN_EMAILS.includes(email)) {
    return true
  }

  // Check if domain is in admin domains
  if (ADMIN_DOMAINS.includes(domain)) {
    return true
  }

  return false
}

export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('Admin access required')
  }

  return true
}

export async function getAdminUser() {
  const session = await auth()
  const admin = await isAdmin()

  if (!admin || !session?.user) {
    return null
  }

  return {
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    tenantId: (session.user as any).tenantId,
  }
}
