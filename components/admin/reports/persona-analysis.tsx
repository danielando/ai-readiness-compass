"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, Target, AlertTriangle, Clock, TrendingUp } from "lucide-react"

interface PersonaData {
  distribution: { [key: string]: number }
  examples: { [key: string]: any[] }
  details: { [key: string]: PersonaDetails }
  totalClassified: number
}

interface PersonaDetails {
  description: string
  characteristics: string[]
  priority: string
  approach: string
  recommendations: string[]
}

interface Props {
  personas: PersonaData | null
  loading: boolean
}

const PERSONA_COLORS = {
  'Principal Pat': 'bg-green-500',
  'Enthusiastic Emma': 'bg-yellow-500',
  'Curious Chris': 'bg-blue-500',
  'Cautious Clara': 'bg-orange-500',
  'Traditionalist Tim': 'bg-gray-500',
  'Overwhelmed Owen': 'bg-purple-500'
}

const PERSONA_ICONS = {
  'Principal Pat': Sparkles,
  'Enthusiastic Emma': Target,
  'Curious Chris': TrendingUp,
  'Cautious Clara': AlertTriangle,
  'Traditionalist Tim': Clock,
  'Overwhelmed Owen': Users
}

export function PersonaAnalysis({ personas, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Analyzing personas...</span>
      </div>
    )
  }

  if (!personas || personas.totalClassified === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">No Data Available</p>
        <p className="text-sm">Persona analysis will appear once survey responses are collected</p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'bg-red-500'
    if (priority === 'Medium') return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const sortedPersonas = Object.entries(personas.distribution)
    .sort((a, b) => b[1] - a[1])

  const totalCount = personas.totalClassified

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total People Classified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Common Persona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-900 truncate">
              {sortedPersonas[0]?.[0] || 'N/A'}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {sortedPersonas[0]?.[1]} people ({Math.round((sortedPersonas[0]?.[1] / totalCount) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Persona Types Found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {Object.keys(personas.distribution).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">of 6 possible types</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Distribution</CardTitle>
          <CardDescription>How your respondents are categorized</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPersonas.map(([persona, count]) => {
              const percentage = Math.round((count / totalCount) * 100)
              const Icon = PERSONA_ICONS[persona as keyof typeof PERSONA_ICONS] || Users
              const color = PERSONA_COLORS[persona as keyof typeof PERSONA_COLORS] || 'bg-gray-500'

              return (
                <div key={persona} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{persona}</span>
                        <p className="text-xs text-gray-600">{personas.details[persona]?.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{count}</span>
                      <span className="text-gray-500 text-sm ml-1">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Persona Details & Recommendations */}
      <div className="space-y-4">
        {sortedPersonas.map(([persona, count]) => {
          const details = personas.details[persona]
          if (!details) return null

          const Icon = PERSONA_ICONS[persona as keyof typeof PERSONA_ICONS] || Users
          const color = PERSONA_COLORS[persona as keyof typeof PERSONA_COLORS] || 'bg-gray-500'

          return (
            <Card key={persona} className="border-l-4" style={{ borderLeftColor: color.replace('bg-', '#') }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {persona}
                        <Badge className={getPriorityColor(details.priority)}>
                          {details.priority} Priority
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">{details.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold">
                    {count} {count === 1 ? 'person' : 'people'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Characteristics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.characteristics.map((char, idx) => (
                      <Badge key={idx} variant="secondary">{char}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recommended Approach: {details.approach}
                  </h4>
                  <ul className="space-y-2">
                    {details.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {personas.examples[persona] && personas.examples[persona].length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Example Respondents:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {personas.examples[persona].map((example, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 p-2 rounded border">
                          <div className="font-medium truncate">{example.email || 'Anonymous'}</div>
                          <div className="text-gray-600">{example.department}</div>
                          <div className="text-gray-500">{example.roleLevel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Priority Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Action Priority Summary</CardTitle>
          <CardDescription>Focus areas based on persona distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPersonas
              .filter(([persona]) => personas.details[persona]?.priority === 'High')
              .map(([persona, count]) => {
                const Icon = PERSONA_ICONS[persona as keyof typeof PERSONA_ICONS] || Users
                return (
                  <div key={persona} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Icon className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <span className="font-semibold text-red-900">{persona}</span>
                      <span className="text-red-700 text-sm ml-2">({count} people)</span>
                    </div>
                    <Badge className="bg-red-500">High Priority</Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
