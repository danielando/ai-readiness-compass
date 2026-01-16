"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number
  total: number
  primaryColor?: string
}

export function ProgressBar({ current, total, primaryColor }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {current} of {total}
          </span>
          <span className="text-sm font-semibold" style={{ color: primaryColor }}>
            {percentage}%
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  )
}
