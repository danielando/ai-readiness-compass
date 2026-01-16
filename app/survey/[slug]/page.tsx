"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { WelcomeScreen } from "@/components/survey/welcome-screen"
import { QuestionCard } from "@/components/survey/question-card"
import { CompletionScreen } from "@/components/survey/completion-screen"
import { ProgressBar } from "@/components/survey/progress-bar"
import { surveyData, getTotalQuestions, getQuestionByIndex } from "@/lib/survey-data"
import { SurveyResponse, ClientBranding } from "@/lib/types/survey"

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { data: session, status } = useSession()

  const [stage, setStage] = useState<"welcome" | "survey" | "complete">("welcome")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<SurveyResponse>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [authValidated, setAuthValidated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Demo branding - in production, this would be fetched from Supabase based on slug
  const [branding] = useState<ClientBranding>({
    clientName: "Demo Organization",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
  })

  const totalQuestions = getTotalQuestions()
  const currentQuestion = getQuestionByIndex(currentQuestionIndex)

  useEffect(() => {
    // Keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && stage === "welcome") {
        handleStart()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [stage])

  // Load saved responses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`survey-${slug}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setResponses(data.responses || {})
        setCurrentQuestionIndex(data.currentIndex || 0)
      } catch (e) {
        console.error("Failed to load saved survey:", e)
      }
    }
  }, [slug])

  // Validate authentication - Check both M365 and Supabase admin sessions
  useEffect(() => {
    const validateAccess = async () => {
      // Don't validate until M365 session check is complete
      if (status === "loading") return

      // Try to validate access (will check both M365 and Supabase sessions on server)
      try {
        const response = await fetch('/api/survey/validate-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientSlug: slug }),
        })

        const data = await response.json()

        if (!data.allowed) {
          // Only redirect to M365 sign-in if not authenticated and not an admin
          // Admins will be validated server-side via Supabase session
          if (status === "unauthenticated" && !data.isAdmin) {
            router.push(`/survey/auth/signin?callbackUrl=/survey/${slug}`)
            return
          }
          setAuthError(data.reason || 'Access denied')
          return
        }

        // Access granted (either via M365 or admin session)
        setAuthValidated(true)
      } catch (error) {
        console.error('Failed to validate access:', error)
        setAuthError('Failed to validate access. Please try again.')
      }
    }

    validateAccess()
  }, [slug, status, router])

  // Save progress to localStorage
  useEffect(() => {
    if (stage === "survey") {
      localStorage.setItem(`survey-${slug}`, JSON.stringify({
        responses,
        currentIndex: currentQuestionIndex,
        timestamp: Date.now(),
      }))
    }
  }, [responses, currentQuestionIndex, slug, stage])

  const handleStart = () => {
    setStage("survey")
    setStartTime(Date.now())
  }

  const handleAnswerChange = (value: string | string[] | number) => {
    if (!currentQuestion) return

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.dbField]: value,
    }))
  }

  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      // Submit survey
      await handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) return

    setIsSubmitting(true)
    const completionTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : null

    try {
      const response = await fetch("/api/survey/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          responses,
          completionTime,
        }),
      })

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem(`survey-${slug}`)
        setStage("complete")
      } else {
        console.error("Failed to submit survey")
        alert("Failed to submit survey. Please try again.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting survey:", error)
      alert("An error occurred while submitting the survey. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (stage === "welcome") {
    return <WelcomeScreen branding={branding} onStart={handleStart} />
  }

  if (stage === "complete") {
    return <CompletionScreen branding={branding} />
  }

  // Show loading while checking authentication
  if (status === "loading" || !authValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button
            onClick={() => router.push(`/survey/auth/signin?callbackUrl=/survey/${slug}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Question not found</p>
      </div>
    )
  }

  return (
    <>
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={totalQuestions}
        primaryColor={branding.primaryColor}
      />
      <QuestionCard
        question={currentQuestion}
        value={(responses[currentQuestion.dbField] ?? null) as string | number | string[] | null}
        onChange={handleAnswerChange}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoBack={currentQuestionIndex > 0}
        primaryColor={branding.primaryColor}
        isAnimating={isAnimating}
      />
    </>
  )
}
