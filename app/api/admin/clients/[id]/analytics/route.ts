import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

interface ResponseData {
  [key: string]: any
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get all responses for this client
    const { data: responses, error } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('client_id', id)

    if (error) {
      console.error('Analytics fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({
        totalResponses: 0,
        readinessScore: null,
        summary: null,
      })
    }

    // Calculate analytics
    const analytics = calculateAnalytics(responses)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAnalytics(responses: ResponseData[]) {
  const totalResponses = responses.length

  // Calculate readiness scores by category
  const adoptionScore = calculateAdoptionScore(responses)
  const awarenessScore = calculateAwarenessScore(responses)
  const readinessScore = calculateReadinessScore(responses)
  const barriersScore = calculateBarriersScore(responses)
  const skillsScore = calculateSkillsScore(responses)

  // Overall readiness score (weighted average)
  const overallScore = Math.round(
    (adoptionScore * 0.25 +
     awarenessScore * 0.2 +
     readinessScore * 0.3 +
     skillsScore * 0.15 +
     barriersScore * 0.1)
  )

  // Segmentation analysis
  const byDepartment = segmentBy(responses, 'department')
  const byRoleLevel = segmentBy(responses, 'role_level')
  const byLocation = segmentBy(responses, 'location')
  const byTenure = segmentBy(responses, 'tenure')

  // Barrier analysis
  const barriers = analyzeBarriers(responses)

  // Opportunity areas
  const opportunities = identifyOpportunities(responses)

  // Key insights
  const insights = generateInsights(responses, overallScore)

  return {
    totalResponses,
    overallScore,
    categoryScores: {
      adoption: adoptionScore,
      awareness: awarenessScore,
      readiness: readinessScore,
      barriers: barriersScore,
      skills: skillsScore,
    },
    segmentation: {
      byDepartment,
      byRoleLevel,
      byLocation,
      byTenure,
    },
    barriers,
    opportunities,
    insights,
    participationRate: {
      total: totalResponses,
      byDepartment: getDepartmentParticipation(responses),
      byRoleLevel: getRoleLevelParticipation(responses),
    }
  }
}

function calculateAdoptionScore(responses: ResponseData[]): number {
  // Based on current_ai_usage field
  const usageScores = responses.map(r => {
    const usage = r.current_ai_usage
    if (!usage) return 0
    if (usage === 'Daily') return 100
    if (usage === 'Weekly') return 75
    if (usage === 'Monthly') return 50
    if (usage === 'Rarely') return 25
    return 0
  })
  return Math.round(usageScores.reduce((a, b) => a + b, 0) / responses.length)
}

function calculateAwarenessScore(responses: ResponseData[]): number {
  // Based on ai_tools_awareness
  const awarenessScores = responses.map(r => {
    const awareness = r.ai_tools_awareness
    if (!awareness) return 0
    if (Array.isArray(awareness)) {
      // More tools aware of = higher score
      return Math.min(100, (awareness.length / 8) * 100)
    }
    return 0
  })
  return Math.round(awarenessScores.reduce((a, b) => a + b, 0) / responses.length)
}

function calculateReadinessScore(responses: ResponseData[]): number {
  // Based on readiness_to_adopt
  const readinessScores = responses.map(r => {
    const readiness = r.readiness_to_adopt
    if (!readiness) return 0
    if (readiness === 'Very ready') return 100
    if (readiness === 'Somewhat ready') return 75
    if (readiness === 'Neutral') return 50
    if (readiness === 'Not very ready') return 25
    return 0
  })
  return Math.round(readinessScores.reduce((a, b) => a + b, 0) / responses.length)
}

function calculateBarriersScore(responses: ResponseData[]): number {
  // Inverse score - fewer barriers = higher score
  const barrierCounts = responses.map(r => {
    const barriers = r.adoption_barriers
    if (!barriers) return 0
    if (Array.isArray(barriers)) return barriers.length
    return 0
  })
  const avgBarriers = barrierCounts.reduce((a, b) => a + b, 0) / responses.length
  // Convert to score (fewer barriers = better)
  return Math.round(Math.max(0, 100 - (avgBarriers * 12.5)))
}

function calculateSkillsScore(responses: ResponseData[]): number {
  // Based on ai_skills_confidence
  const skillsScores = responses.map(r => {
    const confidence = r.ai_skills_confidence
    if (!confidence) return 0
    if (confidence === 'Very confident') return 100
    if (confidence === 'Somewhat confident') return 75
    if (confidence === 'Neutral') return 50
    if (confidence === 'Not very confident') return 25
    return 0
  })
  return Math.round(skillsScores.reduce((a, b) => a + b, 0) / responses.length)
}

function segmentBy(responses: ResponseData[], field: string) {
  const segments: { [key: string]: any } = {}

  responses.forEach(r => {
    const value = r[field] || 'Not specified'
    if (!segments[value]) {
      segments[value] = {
        count: 0,
        adoptionScore: 0,
        readinessScore: 0,
      }
    }
    segments[value].count++
  })

  // Calculate scores for each segment
  Object.keys(segments).forEach(key => {
    const segmentResponses = responses.filter(r => (r[field] || 'Not specified') === key)
    segments[key].adoptionScore = calculateAdoptionScore(segmentResponses)
    segments[key].readinessScore = calculateReadinessScore(segmentResponses)
  })

  return segments
}

function analyzeBarriers(responses: ResponseData[]) {
  const barrierCounts: { [key: string]: number } = {}

  responses.forEach(r => {
    const barriers = r.adoption_barriers
    if (Array.isArray(barriers)) {
      barriers.forEach(barrier => {
        barrierCounts[barrier] = (barrierCounts[barrier] || 0) + 1
      })
    }
  })

  // Convert to percentage and sort
  const total = responses.length
  return Object.entries(barrierCounts)
    .map(([barrier, count]) => ({
      barrier,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
}

function identifyOpportunities(responses: ResponseData[]) {
  const opportunities = []

  // Check for high interest but low adoption
  const highInterest = responses.filter(r =>
    r.readiness_to_adopt === 'Very ready' || r.readiness_to_adopt === 'Somewhat ready'
  ).length
  const lowAdoption = responses.filter(r =>
    r.current_ai_usage === 'Never' || r.current_ai_usage === 'Rarely'
  ).length

  if (highInterest / responses.length > 0.6 && lowAdoption / responses.length > 0.4) {
    opportunities.push({
      title: 'High Interest, Low Adoption',
      description: 'Significant gap between readiness and actual usage suggests opportunity for quick wins',
      impact: 'High',
      effort: 'Medium'
    })
  }

  // Check for skills gap
  const lowConfidence = responses.filter(r =>
    r.ai_skills_confidence === 'Not very confident' || r.ai_skills_confidence === 'Not confident at all'
  ).length

  if (lowConfidence / responses.length > 0.3) {
    opportunities.push({
      title: 'Skills Development Opportunity',
      description: 'Investment in training could significantly boost adoption',
      impact: 'High',
      effort: 'Medium'
    })
  }

  // Check for time savings potential
  const timeSpent = responses.filter(r =>
    r.time_on_repetitive_tasks === '25-50%' || r.time_on_repetitive_tasks === '50%+'
  ).length

  if (timeSpent / responses.length > 0.4) {
    opportunities.push({
      title: 'Automation Potential',
      description: 'High time spent on repetitive tasks indicates strong ROI potential',
      impact: 'Very High',
      effort: 'Medium'
    })
  }

  return opportunities
}

function generateInsights(responses: ResponseData[], overallScore: number) {
  const insights = []

  // Overall maturity
  if (overallScore >= 75) {
    insights.push({
      type: 'positive',
      title: 'Advanced AI Readiness',
      description: 'Your organization shows strong AI readiness across multiple dimensions'
    })
  } else if (overallScore >= 50) {
    insights.push({
      type: 'neutral',
      title: 'Moderate AI Readiness',
      description: 'Good foundation with clear opportunities for improvement'
    })
  } else {
    insights.push({
      type: 'warning',
      title: 'Early Stage AI Readiness',
      description: 'Significant opportunity to build AI capabilities and culture'
    })
  }

  // Check for enthusiastic early adopters
  const earlyAdopters = responses.filter(r => r.current_ai_usage === 'Daily').length
  if (earlyAdopters > 0) {
    insights.push({
      type: 'positive',
      title: `${earlyAdopters} Early Adopters Identified`,
      description: 'Leverage these power users as champions and trainers'
    })
  }

  // Check for leadership support
  const executiveResponses = responses.filter(r => r.role_level === 'Executive' || r.role_level === 'Director')
  if (executiveResponses.length > 0) {
    const executiveAdoption = calculateAdoptionScore(executiveResponses)
    if (executiveAdoption > 70) {
      insights.push({
        type: 'positive',
        title: 'Strong Leadership Engagement',
        description: 'Executive team shows high AI adoption, setting tone from the top'
      })
    }
  }

  return insights
}

function getDepartmentParticipation(responses: ResponseData[]) {
  const deptCounts: { [key: string]: number } = {}
  responses.forEach(r => {
    const dept = r.department || 'Not specified'
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  })
  return deptCounts
}

function getRoleLevelParticipation(responses: ResponseData[]) {
  const roleCounts: { [key: string]: number } = {}
  responses.forEach(r => {
    const role = r.role_level || 'Not specified'
    roleCounts[role] = (roleCounts[role] || 0) + 1
  })
  return roleCounts
}
