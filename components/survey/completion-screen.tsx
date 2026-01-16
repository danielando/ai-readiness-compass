"use client"

import { ClientBranding } from "@/lib/types/survey"
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react"

interface CompletionScreenProps {
  branding: ClientBranding
}

export function CompletionScreen({ branding }: CompletionScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 transition-colors"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.secondaryColor}08 100%)`
      }}
    >
      <div className="max-w-3xl w-full space-y-12 animate-fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20 rounded-full bg-gray-900"></div>
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center bg-gray-100">
              <CheckCircle2
                className="w-16 h-16 text-gray-900"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            Thank You!
          </h1>
          <p className="text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Your responses have been recorded successfully
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-200 shadow-xl shadow-gray-200/50 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gray-900"></div>
            <h2 className="text-xl font-semibold text-gray-900">What happens next</h2>
          </div>

          <div className="grid gap-6">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                <TrendingUp className="w-6 h-6 text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your feedback will help shape our AI adoption strategy and identify opportunities for productivity improvements across the organization.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Report</h3>
                <p className="text-gray-600 leading-relaxed">
                  The insights gathered from this assessment will be compiled into a comprehensive report that will guide our AI enablement initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          You may now close this window
        </p>
      </div>
    </div>
  )
}
