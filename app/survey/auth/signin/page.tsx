'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SignInContent() {
  const searchParams = useSearchParams()
  const [clientName, setClientName] = useState<string>('')
  const [clientLogo, setClientLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  useEffect(() => {
    // Extract client info from callback URL
    const match = callbackUrl.match(/\/survey\/([^/]+)/)
    if (match) {
      const slug = match[1]
      // Fetch client details
      fetch(`/api/survey/client-info?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.client) {
            setClientName(data.client.name)
            setClientLogo(data.client.logo)
          }
        })
        .catch(console.error)
    }
  }, [callbackUrl])

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('azure-ad', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-md">
        {clientLogo && (
          <div className="flex justify-center pt-6">
            <img src={clientLogo} alt={clientName} className="h-16 object-contain" />
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {clientName ? `${clientName} - AI Readiness Survey` : 'Sign In Required'}
          </CardTitle>
          <CardDescription>
            This survey requires authentication with your Microsoft 365 account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error === 'AccessDenied' && 'Access denied. Your organization may not be authorized for this survey.'}
              {error === 'Configuration' && 'Authentication is not properly configured. Please contact support.'}
              {error === 'Verification' && 'Unable to verify your identity. Please try again.'}
              {!['AccessDenied', 'Configuration', 'Verification'].includes(error) && 'An error occurred during sign in.'}
            </div>
          )}

          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-12 text-base"
          >
            {loading ? (
              'Redirecting to Microsoft...'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="none">
                  <path fill="#f25022" d="M0 0h11v11H0z" />
                  <path fill="#00a4ef" d="M12 0h11v11H12z" />
                  <path fill="#7fba00" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to participate in this AI readiness assessment.
            Your responses will be anonymized for reporting purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
