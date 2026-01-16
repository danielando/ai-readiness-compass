import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI Readiness Assessment Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Evaluate your organization's AI adoption readiness with comprehensive surveys and insights
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/survey/demo"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            View Demo Survey
          </Link>
        </div>
      </div>
    </div>
  )
}
