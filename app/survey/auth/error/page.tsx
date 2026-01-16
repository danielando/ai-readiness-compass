'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'Your organization is not authorized to access this survey. Please contact the survey administrator if you believe this is an error.',
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'Microsoft 365 authentication is not properly configured. Please contact support.',
        }
      case 'Verification':
        return {
          title: 'Verification Failed',
          message: 'Unable to verify your identity with Microsoft 365. Please try again.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during sign in. Please try again or contact support.',
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-base text-gray-700 mt-2">
            {errorInfo.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'AccessDenied' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-900">
              <strong>Need access?</strong>
              <p className="mt-1">
                Contact the survey administrator to have your organization added to the approved list.
              </p>
            </div>
          )}

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Return to Home
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Error Code: {error || 'UNKNOWN'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
