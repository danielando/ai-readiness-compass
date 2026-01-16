'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClient() {
  const [clientName, setClientName] = useState('')
  const [clientSlug, setClientSlug] = useState('')
  const [primaryColour, setPrimaryColour] = useState('#3B82F6')
  const [secondaryColour, setSecondaryColour] = useState('#1E40AF')
  const [logoUrl, setLogoUrl] = useState('')
  const [departments, setDepartments] = useState<string[]>([
    'Sales',
    'Marketing',
    'Creative/Design',
    'Content/Communications',
    'Engineering',
    'Product',
    'Operations',
    'Finance',
    'HR',
    'Learning & Development',
    'Customer Success/Support',
    'IT',
    'Other'
  ])
  const [locations, setLocations] = useState<string[]>([
    'Sydney',
    'Melbourne',
    'Brisbane',
    'Perth',
    'Remote',
    'Other'
  ])
  const [newDepartment, setNewDepartment] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setClientName(name)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setClientSlug(slug)
  }

  const addDepartment = () => {
    if (newDepartment && !departments.includes(newDepartment)) {
      setDepartments([...departments, newDepartment])
      setNewDepartment('')
    }
  }

  const removeDepartment = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept))
  }

  const addLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation])
      setNewLocation('')
    }
  }

  const removeLocation = (loc: string) => {
    setLocations(locations.filter(l => l !== loc))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create client via API (uses service role to bypass RLS)
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientSlug,
          logoUrl,
          primaryColour,
          secondaryColour,
          departments,
          locations,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client')
      }

      // Redirect to dashboard (client detail page has RLS issues with M365 auth)
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Client</CardTitle>
            <CardDescription>
              Set up a new organization with custom branding and segmentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div className="space-y-2">
                  <label htmlFor="clientName" className="text-sm font-medium">
                    Client Name *
                  </label>
                  <Input
                    id="clientName"
                    placeholder="e.g., Acme Corporation"
                    value={clientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="clientSlug" className="text-sm font-medium">
                    Survey URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">yoursite.com/survey/</span>
                    <Input
                      id="clientSlug"
                      placeholder="acme-corporation"
                      value={clientSlug}
                      onChange={(e) => setClientSlug(e.target.value)}
                      required
                      disabled={loading}
                      pattern="[a-z0-9-]+"
                      title="Only lowercase letters, numbers, and hyphens"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="logoUrl" className="text-sm font-medium">
                    Logo URL (Optional)
                  </label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Brand Colors</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="primaryColour" className="text-sm font-medium">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColour"
                        type="color"
                        value={primaryColour}
                        onChange={(e) => setPrimaryColour(e.target.value)}
                        disabled={loading}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={primaryColour}
                        onChange={(e) => setPrimaryColour(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="secondaryColour" className="text-sm font-medium">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColour"
                        type="color"
                        value={secondaryColour}
                        onChange={(e) => setSecondaryColour(e.target.value)}
                        disabled={loading}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={secondaryColour}
                        onChange={(e) => setSecondaryColour(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Departments</h3>
                <p className="text-sm text-gray-600">
                  Customize departments for your organization
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
                    disabled={loading}
                  />
                  <Button type="button" onClick={addDepartment} disabled={loading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="gap-1">
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="ml-1 hover:text-red-600"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Locations</h3>
                <p className="text-sm text-gray-600">
                  Customize locations for your organization
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                    disabled={loading}
                  />
                  <Button type="button" onClick={addLocation} disabled={loading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <Badge key={loc} variant="secondary" className="gap-1">
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeLocation(loc)}
                        className="ml-1 hover:text-red-600"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/admin/dashboard">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
