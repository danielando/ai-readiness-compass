"use client"

import { Button } from "@/components/ui/button"
import { ClientBranding } from "@/lib/types/survey"
import Image from "next/image"
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react"

interface WelcomeScreenProps {
  branding: ClientBranding
  onStart: () => void
}

export function WelcomeScreen({ branding, onStart }: WelcomeScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 transition-colors"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.secondaryColor}08 100%)`
      }}
    >
      <div className="max-w-3xl w-full space-y-12 animate-fade-in">
        {branding.logoUrl && (
          <div className="flex justify-center">
            <Image
              src={branding.logoUrl}
              alt={branding.clientName}
              width={160}
              height={64}
              className="max-w-[160px] h-auto opacity-90"
            />
          </div>
        )}

        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            AI Readiness Assessment
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
            Help us understand how your organization can benefit from AI adoption
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-200 shadow-xl shadow-gray-200/50 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gray-900"></div>
            <h2 className="text-xl font-semibold text-gray-900">What to expect</h2>
          </div>

          <div className="grid gap-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <CheckCircle2 className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">35 questions across 8 sections</p>
                <p className="text-sm text-gray-500 mt-1">Covering current usage, challenges, and opportunities</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <Clock className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">8-10 minutes to complete</p>
                <p className="text-sm text-gray-500 mt-1">Your progress will be saved automatically</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Your responses will help shape AI initiatives</p>
                <p className="text-sm text-gray-500 mt-1">Providing valuable insights for your organization</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-4">
          <Button
            onClick={onStart}
            size="lg"
            className="group text-lg px-10 py-7 h-auto rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            Begin Survey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-sm text-gray-400 flex items-center gap-2">
            Press <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-mono text-xs shadow-sm">Enter ↵</kbd> to start
          </p>
        </div>
      </div>
    </div>
  )
}
