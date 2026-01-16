'use client'

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If already signed in, determine where to route the user
    const checkRouteDestination = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/auth/route-destination')
          const data = await response.json()

          if (data.destination) {
            router.push(data.destination)
          }
        } catch (error) {
          console.error('Failed to determine route destination:', error)
          // Fallback to admin dashboard
          router.push('/admin/dashboard')
        }
      }
    }

    checkRouteDestination()
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">
            Compass
          </h1>
          <p className="text-xl text-gray-600">
            AI Readiness Assessment Platform
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 max-w-xl mx-auto">
          <div className="flex items-start gap-4 text-left p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200">
              <Building2 className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Multi-tenant Platform</h3>
              <p className="text-sm text-gray-600">Manage multiple client assessments with custom branding</p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-left p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200">
              <TrendingUp className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Comprehensive Insights</h3>
              <p className="text-sm text-gray-600">35 questions across 8 sections to evaluate AI readiness</p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-left p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200">
              <Shield className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
              <p className="text-sm text-gray-600">Microsoft 365 SSO authentication for secure access</p>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="space-y-4">
          <Button
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
            size="lg"
            className="text-lg px-10 py-7 h-auto rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23" fill="none">
              <path d="M11 11h11v11H11z" fill="#FEBA08"/>
              <path d="M0 11h11v11H0z" fill="#05A6F0"/>
              <path d="M11 0h11v11H11z" fill="#80BC06"/>
              <path d="M0 0h11v11H0z" fill="#F25325"/>
            </svg>
            Sign in with Microsoft 365
          </Button>
          <p className="text-sm text-gray-400">
            Secure authentication powered by Azure Active Directory
          </p>
        </div>
      </div>
    </div>
  )
}
