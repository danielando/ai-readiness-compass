"use client"

import { Question, QuestionOption } from "@/lib/types/survey"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { useState, useEffect } from "react"

interface QuestionCardProps {
  question: Question
  value: string | string[] | number | null
  onChange: (value: string | string[] | number) => void
  onNext: () => void
  onPrevious: () => void
  canGoBack: boolean
  primaryColor: string
  isAnimating: boolean
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoBack,
  primaryColor,
  isAnimating,
}: QuestionCardProps) {
  const [textValue, setTextValue] = useState("")

  useEffect(() => {
    if (question.type === "text" && typeof value === "string") {
      setTextValue(value)
    }
  }, [question.id, value, question.type])

  const handleSingleSelect = (option: string) => {
    onChange(option)
    // Auto-advance after selection (TypeForm style)
    setTimeout(() => {
      onNext()
    }, 300)
  }

  const handleMultiSelect = (option: string) => {
    const currentValues = Array.isArray(value) ? value : []
    if (currentValues.includes(option)) {
      onChange(currentValues.filter((v) => v !== option))
    } else {
      if (question.maxSelections && currentValues.length >= question.maxSelections) {
        return
      }
      onChange([...currentValues, option])
    }
  }

  const handleScale = (scaleValue: number) => {
    onChange(scaleValue)
    // Auto-advance after selection
    setTimeout(() => {
      onNext()
    }, 300)
  }

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      onChange(textValue)
      onNext()
    }
  }

  const isSelected = (option: string) => {
    if (Array.isArray(value)) {
      return value.includes(option)
    }
    return value === option
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-6 md:p-8 pt-32 md:pt-36 transition-all duration-300",
        isAnimating ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="max-w-3xl w-full space-y-10">
        {/* Section header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-gray-900"></div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Section {question.sectionNumber} · {question.section}
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            {question.question}
            {question.required && <span className="text-red-500 ml-2">*</span>}
          </h2>
        </div>

        {/* Question input based on type */}
        <div className="space-y-4">
          {question.type === "single-select" && question.options && (
            <div className="space-y-3">
              {question.options.map((option: QuestionOption, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSingleSelect(option.value)}
                  className={cn(
                    "group w-full text-left px-7 py-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                    isSelected(option.value)
                      ? "border-gray-900 shadow-lg bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-medium text-gray-900 group-hover:text-gray-900">{option.label}</span>
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all",
                        isSelected(option.value) ? "border-4 border-gray-900" : "border-gray-300 group-hover:border-gray-400"
                      )}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {question.type === "multi-select" && question.options && (
            <div className="space-y-3">
              {question.maxSelections && (
                <p className="text-sm font-medium text-gray-500 mb-4">
                  Select up to {question.maxSelections} {question.maxSelections === 1 ? 'option' : 'options'}
                </p>
              )}
              {question.options.map((option: QuestionOption, index: number) => (
                <button
                  key={index}
                  onClick={() => handleMultiSelect(option.value)}
                  className={cn(
                    "group w-full text-left px-7 py-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                    isSelected(option.value)
                      ? "border-gray-900 shadow-lg bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-medium text-gray-900">{option.label}</span>
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                        isSelected(option.value) ? "border-transparent bg-gray-900" : "border-gray-300 group-hover:border-gray-400"
                      )}
                    >
                      {isSelected(option.value) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 6l3 3 5-6" />
                        </svg>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {question.type === "scale" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center gap-3">
                {Array.from({ length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 }, (_, i) => {
                  const scaleValue = (question.scaleMin || 1) + i
                  return (
                    <button
                      key={scaleValue}
                      onClick={() => handleScale(scaleValue)}
                      className={cn(
                        "flex-1 aspect-square flex items-center justify-center text-2xl font-bold rounded-2xl border-2 transition-all duration-200 hover:shadow-xl hover:scale-105",
                        value === scaleValue
                          ? "border-gray-900 bg-gray-900 shadow-xl text-white scale-105"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                      )}
                    >
                      {scaleValue}
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500 px-1">
                <span>{question.scaleMinLabel}</span>
                <span>{question.scaleMaxLabel}</span>
              </div>
            </div>
          )}

          {question.type === "text" && (
            <div className="space-y-4">
              <Input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit()
                  }
                }}
                placeholder="Type your answer here..."
                className="text-lg py-7 px-6 rounded-xl border-2 border-gray-200 focus:border-gray-900 transition-colors bg-white"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-8">
          {canGoBack && (
            <Button
              onClick={onPrevious}
              variant="outline"
              size="lg"
              className="px-10 py-6 text-base rounded-xl border-2 hover:bg-gray-50"
            >
              ← Back
            </Button>
          )}
          {(question.type === "multi-select" || question.type === "text") && (
            <Button
              onClick={question.type === "text" ? handleTextSubmit : onNext}
              size="lg"
              className="px-10 py-6 text-base font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              disabled={question.required && (!value || (Array.isArray(value) && value.length === 0) || (question.type === "text" && !textValue.trim()))}
            >
              OK ✓
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-400 flex items-center gap-2">
          Press <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-mono text-xs shadow-sm">Enter ↵</kbd> to continue
        </p>
      </div>
    </div>
  )
}
