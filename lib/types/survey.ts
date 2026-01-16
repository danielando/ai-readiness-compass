export type QuestionType = 'single-select' | 'multi-select' | 'scale' | 'text'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: number
  section: string
  sectionNumber: number
  question: string
  type: QuestionType
  options?: QuestionOption[]
  dbField: string
  required: boolean
  scaleMin?: number
  scaleMax?: number
  scaleMinLabel?: string
  scaleMaxLabel?: string
  maxSelections?: number
}

export interface SurveySection {
  number: number
  title: string
  purpose: string
  questions: Question[]
}

export interface SurveyResponse {
  [key: string]: string | string[] | number | boolean | null
}

export interface ClientBranding {
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  clientName: string
}
