import { SurveySection } from "./types/survey"

export const surveyData: SurveySection[] = [
  {
    number: 1,
    title: "About You",
    purpose: "Segmentation and prioritisation analysis",
    questions: [
      {
        id: 1,
        section: "About You",
        sectionNumber: 1,
        question: "What is your role level?",
        type: "single-select",
        dbField: "role_level",
        required: true,
        options: [
          { value: "Individual Contributor", label: "Individual Contributor" },
          { value: "Team Lead", label: "Team Lead" },
          { value: "Manager", label: "Manager" },
          { value: "Senior Manager", label: "Senior Manager" },
          { value: "Director", label: "Director" },
          { value: "Executive", label: "Executive" },
        ],
      },
      {
        id: 2,
        section: "About You",
        sectionNumber: 1,
        question: "Which department do you work in?",
        type: "single-select",
        dbField: "department",
        required: true,
        options: [
          { value: "Sales", label: "Sales" },
          { value: "Marketing", label: "Marketing" },
          { value: "Creative/Design", label: "Creative/Design" },
          { value: "Content/Communications", label: "Content/Communications" },
          { value: "Engineering", label: "Engineering" },
          { value: "Product", label: "Product" },
          { value: "Operations", label: "Operations" },
          { value: "Finance", label: "Finance" },
          { value: "HR", label: "Human Resources" },
          { value: "Learning & Development", label: "Learning & Development" },
          { value: "Customer Success/Support", label: "Customer Success/Support" },
          { value: "IT", label: "IT" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        id: 3,
        section: "About You",
        sectionNumber: 1,
        question: "How long have you been with the organisation?",
        type: "single-select",
        dbField: "tenure",
        required: true,
        options: [
          { value: "Less than 1 year", label: "Less than 1 year" },
          { value: "1-3 years", label: "1-3 years" },
          { value: "3-5 years", label: "3-5 years" },
          { value: "5+ years", label: "5+ years" },
        ],
      },
      {
        id: 4,
        section: "About You",
        sectionNumber: 1,
        question: "Do you manage direct reports?",
        type: "single-select",
        dbField: "has_direct_reports",
        required: true,
        options: [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ],
      },
      {
        id: 5,
        section: "About You",
        sectionNumber: 1,
        question: "Which location/office are you based in?",
        type: "single-select",
        dbField: "location",
        required: true,
        options: [
          { value: "Sydney", label: "Sydney" },
          { value: "Melbourne", label: "Melbourne" },
          { value: "Brisbane", label: "Brisbane" },
          { value: "Perth", label: "Perth" },
          { value: "Remote", label: "Remote" },
          { value: "Other", label: "Other" },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "Current AI Adoption",
    purpose: "Establishes baseline adoption and awareness",
    questions: [
      {
        id: 6,
        section: "Current AI Adoption",
        sectionNumber: 2,
        question: "How would you rate your current familiarity with AI tools (e.g., Copilot, ChatGPT, Gemini)?",
        type: "scale",
        dbField: "ai_familiarity",
        required: true,
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: "No familiarity",
        scaleMaxLabel: "Very confident user",
      },
      {
        id: 7,
        section: "Current AI Adoption",
        sectionNumber: 2,
        question: "How frequently do you use AI tools for work-related tasks?",
        type: "single-select",
        dbField: "ai_usage_frequency",
        required: true,
        options: [
          { value: "Never", label: "Never" },
          { value: "Rarely (monthly)", label: "Rarely (monthly)" },
          { value: "Sometimes (weekly)", label: "Sometimes (weekly)" },
          { value: "Often (daily)", label: "Often (daily)" },
          { value: "Constantly (multiple times daily)", label: "Constantly (multiple times daily)" },
        ],
      },
      {
        id: 8,
        section: "Current AI Adoption",
        sectionNumber: 2,
        question: "Which AI tools, if any, are you currently using for work?",
        type: "multi-select",
        dbField: "ai_tools_used",
        required: true,
        options: [
          // Text & Productivity AI
          { value: "Microsoft Copilot", label: "Microsoft Copilot" },
          { value: "ChatGPT", label: "ChatGPT" },
          { value: "Google Gemini", label: "Google Gemini" },
          { value: "Claude", label: "Claude" },
          { value: "Perplexity", label: "Perplexity" },
          { value: "Other text/productivity AI", label: "Other text/productivity AI" },

          // Image Generation
          { value: "DALL-E", label: "DALL-E" },
          { value: "Midjourney", label: "Midjourney" },
          { value: "Stable Diffusion", label: "Stable Diffusion" },
          { value: "Adobe Firefly", label: "Adobe Firefly" },
          { value: "Other image generation tools", label: "Other image generation tools" },

          // Design Tools
          { value: "Canva AI", label: "Canva AI" },
          { value: "Adobe Express", label: "Adobe Express" },
          { value: "Figma AI", label: "Figma AI" },
          { value: "Other design tools", label: "Other design tools" },

          // Video Generation
          { value: "Runway", label: "Runway" },
          { value: "Pika", label: "Pika" },
          { value: "Sora", label: "Sora" },
          { value: "Synthesia", label: "Synthesia" },
          { value: "Other video generation tools", label: "Other video generation tools" },

          // Voice & Audio
          { value: "ElevenLabs", label: "ElevenLabs" },
          { value: "Descript", label: "Descript" },
          { value: "Adobe Podcast", label: "Adobe Podcast" },
          { value: "Other voice/audio AI", label: "Other voice/audio AI" },

          // None
          { value: "None", label: "I don't use AI tools for work" },
        ],
      },
      {
        id: 9,
        section: "Current AI Adoption",
        sectionNumber: 2,
        question: "Is your use of AI tools supported by your organisation, or are you using them independently?",
        type: "single-select",
        dbField: "ai_usage_support",
        required: true,
        options: [
          { value: "Officially supported", label: "Officially supported" },
          { value: "Informally tolerated", label: "Informally tolerated" },
          { value: "Using independently", label: "Using independently" },
          { value: "Unsure", label: "Unsure" },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Time & Productivity",
    purpose: "Quantifies opportunity for executive business case",
    questions: [
      {
        id: 10,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "How many hours per week do you estimate you spend on administrative tasks (emails, scheduling, status updates, filing)?",
        type: "single-select",
        dbField: "admin_task_hours",
        required: true,
        options: [
          { value: "0-2 hours", label: "0-2 hours" },
          { value: "2-5 hours", label: "2-5 hours" },
          { value: "5-10 hours", label: "5-10 hours" },
          { value: "10-15 hours", label: "10-15 hours" },
          { value: "15+ hours", label: "15+ hours" },
        ],
      },
      {
        id: 11,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "How many hours per week do you spend searching for information or documents?",
        type: "single-select",
        dbField: "searching_info_hours",
        required: true,
        options: [
          { value: "0-2 hours", label: "0-2 hours" },
          { value: "2-5 hours", label: "2-5 hours" },
          { value: "5-10 hours", label: "5-10 hours" },
          { value: "10+ hours", label: "10+ hours" },
        ],
      },
      {
        id: 12,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "How many hours per week do you spend in meetings?",
        type: "single-select",
        dbField: "meeting_hours",
        required: true,
        options: [
          { value: "0-5 hours", label: "0-5 hours" },
          { value: "5-10 hours", label: "5-10 hours" },
          { value: "10-15 hours", label: "10-15 hours" },
          { value: "15-20 hours", label: "15-20 hours" },
          { value: "20+ hours", label: "20+ hours" },
        ],
      },
      {
        id: 13,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "How much of your meeting time is spent on status updates or information sharing (versus decision-making or collaboration)?",
        type: "single-select",
        dbField: "meeting_status_percent",
        required: true,
        options: [
          { value: "0-25%", label: "0-25%" },
          { value: "25-50%", label: "25-50%" },
          { value: "50-75%", label: "50-75%" },
          { value: "75-100%", label: "75-100%" },
        ],
      },
      {
        id: 14,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "How many hours per week do you spend creating or formatting documents, presentations, or reports?",
        type: "single-select",
        dbField: "document_creation_hours",
        required: true,
        options: [
          { value: "0-2 hours", label: "0-2 hours" },
          { value: "2-5 hours", label: "2-5 hours" },
          { value: "5-10 hours", label: "5-10 hours" },
          { value: "10+ hours", label: "10+ hours" },
        ],
      },
      {
        id: 15,
        section: "Time & Productivity",
        sectionNumber: 3,
        question: "If AI could save you 5 hours per week, what would you reinvest that time into?",
        type: "single-select",
        dbField: "time_savings_reinvestment",
        required: true,
        options: [
          { value: "Higher-value work", label: "Higher-value work" },
          { value: "Strategic thinking", label: "Strategic thinking" },
          { value: "Customer engagement", label: "Customer engagement" },
          { value: "Learning & development", label: "Learning & development" },
          { value: "Personal wellbeing", label: "Personal wellbeing" },
          { value: "Other", label: "Other" },
        ],
      },
    ],
  },
  // Continue with remaining sections...
]

export const getTotalQuestions = (): number => {
  return surveyData.reduce((total, section) => total + section.questions.length, 0)
}

export const getQuestionByIndex = (index: number) => {
  let currentIndex = 0
  for (const section of surveyData) {
    for (const question of section.questions) {
      if (currentIndex === index) {
        return question
      }
      currentIndex++
    }
  }
  return null
}
