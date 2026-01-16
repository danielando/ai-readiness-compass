'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus, ArrowLeft, Save, Eye, Trash2, Download, Search } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Client {
  id: string
  client_name: string
  client_slug: string
  logo_url: string | null
  primary_colour: string
  secondary_colour: string
  departments: string[]
  locations: string[]
  role_levels: string[]
  survey_status: 'draft' | 'active' | 'closed'
  created_at: string
  require_m365_auth: boolean
  allowed_m365_tenant_ids: string[]
  allowed_m365_domains: string[]
}

interface SurveyResponse {
  id: string
  client_id: string
  submitted_at: string
  completion_time_seconds: number | null
  authenticated_user_email: string | null
  auth_method: string
  role_level: string | null
  department: string | null
  location: string | null
  [key: string]: any
}

export default function ManageClient() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [clientName, setClientName] = useState('')
  const [primaryColour, setPrimaryColour] = useState('#3B82F6')
  const [secondaryColour, setSecondaryColour] = useState('#1E40AF')
  const [logoUrl, setLogoUrl] = useState('')
  const [surveyStatus, setSurveyStatus] = useState<'draft' | 'active' | 'closed'>('draft')
  const [departments, setDepartments] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [newDepartment, setNewDepartment] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [requireM365Auth, setRequireM365Auth] = useState(false)
  const [allowedTenantIds, setAllowedTenantIds] = useState<string[]>([])
  const [allowedDomains, setAllowedDomains] = useState<string[]>([])
  const [newTenantId, setNewTenantId] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [responseCount, setResponseCount] = useState(0)
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('settings')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadClient()
  }, [clientId])

  // Load responses when responses tab is selected
  useEffect(() => {
    if (activeTab === 'responses' && responses.length === 0 && !loadingResponses) {
      loadResponses()
    }
  }, [activeTab])

  const loadClient = async () => {
    try {
      // Load client data via API (uses service role to bypass RLS)
      const response = await fetch(`/api/admin/clients/${clientId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load client')
      }

      const clientData = data.client
      if (!clientData) throw new Error('Client not found')

      setClient(clientData)
      setClientName(clientData.client_name)
      setPrimaryColour(clientData.primary_colour)
      setSecondaryColour(clientData.secondary_colour)
      setLogoUrl(clientData.logo_url || '')
      setSurveyStatus(clientData.survey_status)
      setDepartments(clientData.departments || [])
      setLocations(clientData.locations || [])
      setRequireM365Auth(clientData.require_m365_auth || false)
      setAllowedTenantIds(clientData.allowed_m365_tenant_ids || [])
      setAllowedDomains(clientData.allowed_m365_domains || [])

      // Load response count
      const { count } = await supabase
        .from('responses')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)

      setResponseCount(count || 0)
    } catch (err: any) {
      setError(err.message || 'Failed to load client')
    } finally {
      setLoading(false)
    }
  }

  const loadResponses = async () => {
    setLoadingResponses(true)
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/responses`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load responses')
      }

      setResponses(data.responses || [])
      setResponseCount(data.responses?.length || 0)
    } catch (err: any) {
      console.error('Failed to load responses:', err)
    } finally {
      setLoadingResponses(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCompletionTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const filteredResponses = responses.filter(response => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      response.authenticated_user_email?.toLowerCase().includes(query) ||
      response.department?.toLowerCase().includes(query) ||
      response.role_level?.toLowerCase().includes(query) ||
      response.location?.toLowerCase().includes(query)
    )
  })

  const handleExportCSV = () => {
    if (responses.length === 0) return

    // Get all unique field names from all responses
    const fieldNames = new Set<string>()
    responses.forEach(response => {
      Object.keys(response).forEach(key => fieldNames.add(key))
    })

    const fields = Array.from(fieldNames)
    const csvRows = []

    // Header row
    csvRows.push(fields.map(field => `"${field}"`).join(','))

    // Data rows
    responses.forEach(response => {
      const values = fields.map(field => {
        const value = response[field]
        if (value === null || value === undefined) return '""'
        if (Array.isArray(value)) return `"${value.join(', ')}"`
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${client?.client_slug || 'survey'}-responses-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update client via API (uses service role to bypass RLS)
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          logoUrl,
          primaryColour,
          secondaryColour,
          departments,
          locations,
          surveyStatus,
          requireM365Auth,
          allowedTenantIds,
          allowedDomains,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update client')
      }

      setSuccess('Client updated successfully')
      await loadClient()
    } catch (err: any) {
      setError(err.message || 'Failed to update client')
    } finally {
      setSaving(false)
    }
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

  const addTenantId = () => {
    if (newTenantId && !allowedTenantIds.includes(newTenantId)) {
      setAllowedTenantIds([...allowedTenantIds, newTenantId])
      setNewTenantId('')
    }
  }

  const removeTenantId = (tenantId: string) => {
    setAllowedTenantIds(allowedTenantIds.filter(t => t !== tenantId))
  }

  const addDomain = () => {
    if (newDomain && !allowedDomains.includes(newDomain)) {
      setAllowedDomains([...allowedDomains, newDomain])
      setNewDomain('')
    }
  }

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading client...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Client not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{client.client_name}</h1>
                  <Badge className={getStatusColor(client.survey_status)}>
                    {client.survey_status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {responseCount} responses • Created {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/survey/${client.client_slug}`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Survey
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="responses">Responses ({responseCount})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update client name, branding, and survey status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Survey URL</label>
                  <div className="flex items-center gap-2 text-sm">
                    <code className="bg-gray-100 px-3 py-2 rounded flex-1">
                      /survey/{client.client_slug}
                    </code>
                    <Badge variant="outline">Read-only</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL (Optional)</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={primaryColour}
                        onChange={(e) => setPrimaryColour(e.target.value)}
                        disabled={saving}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={primaryColour}
                        onChange={(e) => setPrimaryColour(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={secondaryColour}
                        onChange={(e) => setSecondaryColour(e.target.value)}
                        disabled={saving}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={secondaryColour}
                        onChange={(e) => setSecondaryColour(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Survey Status</label>
                  <div className="flex gap-2">
                    {(['draft', 'active', 'closed'] as const).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={surveyStatus === status ? 'default' : 'outline'}
                        onClick={() => setSurveyStatus(status)}
                        disabled={saving}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {surveyStatus === 'draft' && 'Survey is not accessible to respondents'}
                    {surveyStatus === 'active' && 'Survey is live and accepting responses'}
                    {surveyStatus === 'closed' && 'Survey is closed, not accepting new responses'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segmentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Customize departments for this organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addDepartment} disabled={saving}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="gap-1 text-sm py-1">
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="ml-1 hover:text-red-600"
                        disabled={saving}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Customize locations for this organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addLocation} disabled={saving}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <Badge key={loc} variant="secondary" className="gap-1 text-sm py-1">
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeLocation(loc)}
                        className="ml-1 hover:text-red-600"
                        disabled={saving}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Microsoft 365 Authentication</CardTitle>
                <CardDescription>
                  All surveys require Microsoft 365 authentication. Configure approved tenants and domains below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-900">🔒 Microsoft 365 Sign-In Required</label>
                    <p className="text-sm text-blue-700">
                      All survey respondents must authenticate with their M365 account. This is a system-wide security policy.
                    </p>
                  </div>
                  <Badge className="bg-blue-600">Always Enabled</Badge>
                </div>

                <>
                    <div className="space-y-6">
                      {/* STEP 1: Email Domains (Required - Easy to get from client) */}
                      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            1
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-bold text-green-900">✅ REQUIRED: Allowed Email Domains</label>
                            <p className="text-sm text-green-800 mt-1">
                              Simply ask your client: "What's your company email domain?" (e.g., company.com)
                              <br />
                              <strong>Tenant IDs will be automatically captured</strong> when users sign in.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="company.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                            disabled={saving}
                            className="bg-white"
                          />
                          <Button type="button" onClick={addDomain} disabled={saving}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {allowedDomains.length === 0 ? (
                          <div className="text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-md">
                            <strong>⚠️ Required:</strong> Add at least one email domain to enable survey access.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {allowedDomains.map((domain) => (
                              <Badge key={domain} className="bg-green-600 text-white gap-1 text-sm py-1 px-3">
                                @{domain}
                                <button
                                  type="button"
                                  onClick={() => removeDomain(domain)}
                                  className="ml-1 hover:text-red-200"
                                  disabled={saving}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* STEP 2: Tenant IDs (Optional - Auto-captured or manual for stricter control) */}
                      <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            2
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-bold text-gray-900">⚙️ OPTIONAL: Tenant IDs (Advanced)</label>
                            <p className="text-sm text-gray-600 mt-1">
                              {allowedTenantIds.length === 0 ? (
                                <>
                                  <strong className="text-green-700">✨ Auto-Capture Mode:</strong> Tenant IDs will be automatically added when users from approved domains sign in.
                                  <br />
                                  <span className="text-xs text-gray-500">Manual configuration only needed for stricter multi-tenant control.</span>
                                </>
                              ) : (
                                <>
                                  <strong className="text-blue-700">🔒 Manual Mode:</strong> Only these specific tenants can access the survey (stricter security).
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="12345678-90ab-cdef-1234-567890abcdef (Optional)"
                            value={newTenantId}
                            onChange={(e) => setNewTenantId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTenantId())}
                            disabled={saving}
                            className="bg-white"
                          />
                          <Button type="button" variant="outline" onClick={addTenantId} disabled={saving}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {allowedTenantIds.length > 0 && (
                          <div className="space-y-2">
                            {allowedTenantIds.map((tenantId) => (
                              <div key={tenantId} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                <code className="text-sm">{tenantId}</code>
                                <button
                                  type="button"
                                  onClick={() => removeTenantId(tenantId)}
                                  className="text-red-600 hover:text-red-700"
                                  disabled={saving}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Setup Instructions */}
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                        <h4 className="font-medium text-blue-900 mb-2">📖 Setup Instructions</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>See <code>M365-AUTH-SETUP.md</code> for complete setup guide</li>
                          <li>Create an app registration in Azure Portal</li>
                          <li>Add environment variables to .env.local</li>
                          <li>Configure redirect URIs for your domain</li>
                        </ul>
                      </div>
                    </div>
                  </>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Survey Responses</CardTitle>
                    <CardDescription>
                      {responseCount} {responseCount === 1 ? 'response' : 'responses'} collected
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadResponses}
                      variant="outline"
                      disabled={loadingResponses}
                    >
                      {loadingResponses ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      disabled={responses.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!loadingResponses && responses.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-semibold mb-2">No responses yet</p>
                    <p className="text-sm">Responses will appear here once users complete the survey</p>
                    <Button onClick={loadResponses} variant="outline" className="mt-4">
                      Load Responses
                    </Button>
                  </div>
                )}

                {responses.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by email, department, role, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Badge variant="secondary">
                        {filteredResponses.length} of {responses.length}
                      </Badge>
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Submitted</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Auth Method</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResponses.map((response) => (
                            <TableRow key={response.id}>
                              <TableCell className="text-sm">
                                {formatDate(response.submitted_at)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {response.authenticated_user_email || (
                                  <span className="text-gray-400">Anonymous</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={response.auth_method === 'm365' ? 'default' : 'secondary'}>
                                  {response.auth_method === 'm365' ? 'M365' : 'Anonymous'}
                                </Badge>
                              </TableCell>
                              <TableCell>{response.department || '-'}</TableCell>
                              <TableCell>{response.role_level || '-'}</TableCell>
                              <TableCell>{response.location || '-'}</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {formatCompletionTime(response.completion_time_seconds)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  onClick={() => setSelectedResponse(response)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {loadingResponses && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading responses...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>AI-generated insights and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Report generation coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Response Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted {formatDate(selectedResponse.submitted_at)}
                </p>
              </div>
              <Button
                onClick={() => setSelectedResponse(null)}
                variant="ghost"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-500">User Email</p>
                  <p className="font-medium">
                    {selectedResponse.authenticated_user_email || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Auth Method</p>
                  <Badge variant={selectedResponse.auth_method === 'm365' ? 'default' : 'secondary'}>
                    {selectedResponse.auth_method === 'm365' ? 'Microsoft 365' : 'Anonymous'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedResponse.department || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role Level</p>
                  <p className="font-medium">{selectedResponse.role_level || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedResponse.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Time</p>
                  <p className="font-medium">
                    {formatCompletionTime(selectedResponse.completion_time_seconds)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Survey Responses</h3>

                {Object.entries(selectedResponse)
                  .filter(([key]) =>
                    !['id', 'client_id', 'submitted_at', 'completion_time_seconds',
                      'authenticated_user_email', 'm365_tenant_id', 'auth_method'].includes(key)
                  )
                  .map(([key, value]) => {
                    if (value === null || value === undefined) return null

                    const displayKey = key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())

                    let displayValue = value
                    if (Array.isArray(value)) {
                      displayValue = value.join(', ')
                    } else if (typeof value === 'object') {
                      displayValue = JSON.stringify(value, null, 2)
                    }

                    return (
                      <div key={key} className="border-b pb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">{displayKey}</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{String(displayValue)}</p>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
              <Button onClick={() => setSelectedResponse(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
