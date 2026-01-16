'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLogin() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If already signed in, redirect to dashboard
    if (session?.user) {
      router.push('/admin/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Compass</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={() => signIn('azure-ad', { callbackUrl: '/admin/dashboard' })}
            className="w-full h-12 text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23" fill="none">
              <path d="M11 11h11v11H11z" fill="#FEBA08"/>
              <path d="M0 11h11v11H0z" fill="#05A6F0"/>
              <path d="M11 0h11v11H11z" fill="#80BC06"/>
              <path d="M0 0h11v11H0z" fill="#F25325"/>
            </svg>
            Sign in with Microsoft 365
          </Button>
          <p className="text-xs text-gray-400 text-center mt-4">
            Secure authentication via Azure Active Directory
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
