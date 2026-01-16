'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, LogOut, Building2, Users, FileText } from 'lucide-react'

interface Client {
  id: string
  client_name: string
  client_slug: string
  survey_status: 'draft' | 'active' | 'closed'
  created_at: string
  response_count?: number
}

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'consultant'
  client_access: string[]
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
        return
      }

      // Get admin user details
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!adminUser) {
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }

      setUser(adminUser)

      // Get clients based on access level
      let query = supabase.from('clients').select('*')

      // If not admin, filter by client_access array
      if (adminUser.role !== 'admin' && adminUser.client_access?.length > 0) {
        query = query.in('id', adminUser.client_access)
      }

      const { data: clientsData } = await query.order('created_at', { ascending: false })

      // Get response counts for each client
      if (clientsData) {
        const clientsWithCounts = await Promise.all(
          clientsData.map(async (client) => {
            const { count } = await supabase
              .from('responses')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', client.id)

            return { ...client, response_count: count || 0 }
          })
        )
        setClients(clientsWithCounts)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
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
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Readiness Portal</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link href="/admin/clients/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clients
              </CardTitle>
              <Building2 className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Surveys
              </CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {clients.filter(c => c.survey_status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Responses
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {clients.reduce((sum, c) => sum + (c.response_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              Manage surveys, view responses, and generate reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No clients yet. Create your first client to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{client.client_name}</h3>
                        <Badge className={getStatusColor(client.survey_status)}>
                          {client.survey_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Slug: <code className="bg-gray-100 px-2 py-1 rounded">{client.client_slug}</code></span>
                        <span>{client.response_count} responses</span>
                        <span>Created {new Date(client.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/survey/${client.client_slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          View Survey
                        </Button>
                      </Link>
                      <Link href={`/admin/clients/${client.id}`}>
                        <Button size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
