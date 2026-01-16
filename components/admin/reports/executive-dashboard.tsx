"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Users, Target, Zap, Award } from "lucide-react"

interface Analytics {
  totalResponses: number
  overallScore: number
  categoryScores: {
    adoption: number
    awareness: number
    readiness: number
    barriers: number
    skills: number
  }
  segmentation: {
    byDepartment: { [key: string]: { count: number; adoptionScore: number; readinessScore: number } }
    byRoleLevel: { [key: string]: { count: number; adoptionScore: number; readinessScore: number } }
    byLocation: { [key: string]: { count: number; adoptionScore: number; readinessScore: number } }
  }
  barriers: Array<{ barrier: string; count: number; percentage: number }>
  opportunities: Array<{ title: string; description: string; impact: string; effort: string }>
  insights: Array<{ type: string; title: string; description: string }>
  participationRate: {
    total: number
    byDepartment: { [key: string]: number }
    byRoleLevel: { [key: string]: number }
  }
}

interface Props {
  analytics: Analytics | null
  loading: boolean
}

export function ExecutiveDashboard({ analytics, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating insights...</span>
      </div>
    )
  }

  if (!analytics || analytics.totalResponses === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">No Data Available</p>
        <p className="text-sm">Analytics will appear once survey responses are collected</p>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-100 border-green-300"
    if (score >= 50) return "bg-yellow-100 border-yellow-300"
    return "bg-red-100 border-red-300"
  }

  const getImpactColor = (impact: string) => {
    if (impact === 'Very High' || impact === 'High') return 'bg-green-500'
    if (impact === 'Medium') return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${getScoreBgColor(analytics.overallScore)} border-2`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-700">Overall AI Readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-4xl font-bold ${getScoreColor(analytics.overallScore)}`}>
                {analytics.overallScore}
              </div>
              <div className="text-2xl text-gray-600">/100</div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.overallScore >= 75 && "Advanced readiness"}
              {analytics.overallScore >= 50 && analytics.overallScore < 75 && "Moderate readiness"}
              {analytics.overallScore < 50 && "Early stage"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Total Responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalResponses}</div>
            <p className="text-xs text-gray-500 mt-1">Survey completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Key Opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.opportunities.length}</div>
            <p className="text-xs text-gray-500 mt-1">Areas identified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Top Barrier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 truncate">
              {analytics.barriers[0]?.barrier || 'None reported'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.barriers[0]?.percentage}% of respondents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Key Insights
            </CardTitle>
            <CardDescription>Critical findings from your survey data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.insights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                  {insight.type === 'neutral' && <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness by Category</CardTitle>
          <CardDescription>Breakdown of AI readiness across key dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analytics.categoryScores).map(([category, score]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">
                  {category.replace('_', ' ')}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                  {score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    score >= 75 ? 'bg-green-500' :
                    score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      {analytics.opportunities && analytics.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategic Opportunities
            </CardTitle>
            <CardDescription>Prioritized recommendations for AI adoption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.opportunities.map((opp, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(opp.impact)}>
                      {opp.impact} Impact
                    </Badge>
                    <Badge variant="outline">{opp.effort} Effort</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{opp.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Segmentation Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readiness by Department</CardTitle>
            <CardDescription>Adoption and readiness scores across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.segmentation.byDepartment)
                .sort((a, b) => b[1].adoptionScore - a[1].adoptionScore)
                .slice(0, 6)
                .map(([dept, data]) => (
                  <div key={dept} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate pr-2">{dept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {data.count} {data.count === 1 ? 'response' : 'responses'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Adoption: <span className={`font-semibold ${getScoreColor(data.adoptionScore)}`}>{data.adoptionScore}</span></div>
                      <div>Readiness: <span className={`font-semibold ${getScoreColor(data.readinessScore)}`}>{data.readinessScore}</span></div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* By Role Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readiness by Role Level</CardTitle>
            <CardDescription>Leadership vs individual contributor readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.segmentation.byRoleLevel)
                .sort((a, b) => b[1].adoptionScore - a[1].adoptionScore)
                .map(([role, data]) => (
                  <div key={role} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate pr-2">{role}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {data.count} {data.count === 1 ? 'response' : 'responses'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Adoption: <span className={`font-semibold ${getScoreColor(data.adoptionScore)}`}>{data.adoptionScore}</span></div>
                      <div>Readiness: <span className={`font-semibold ${getScoreColor(data.readinessScore)}`}>{data.readinessScore}</span></div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Barriers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Top Adoption Barriers
          </CardTitle>
          <CardDescription>Most commonly reported obstacles to AI adoption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.barriers.slice(0, 8).map((barrier, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{barrier.barrier}</span>
                    <span className="text-sm font-semibold text-red-600">{barrier.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${barrier.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
