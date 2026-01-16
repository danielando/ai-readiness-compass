'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus, ArrowLeft, Save, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    try {
      // Load client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
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

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          client_name: clientName,
          logo_url: logoUrl || null,
          primary_colour: primaryColour,
          secondary_colour: secondaryColour,
          departments,
          locations,
          survey_status: surveyStatus,
          require_m365_auth: requireM365Auth,
          allowed_m365_tenant_ids: allowedTenantIds,
          allowed_m365_domains: allowedDomains,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)

      if (updateError) throw updateError

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

        <Tabs defaultValue="settings" className="space-y-6">
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
                <CardTitle>Survey Responses</CardTitle>
                <CardDescription>View and export responses for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-semibold mb-2">{responseCount} Total Responses</p>
                  <p className="text-sm">Response management coming soon</p>
                </div>
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
    </div>
  )
}
