'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database,
  Server,
  Shield,
  Zap,
  Users
} from 'lucide-react'

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error'
    responseTime: number
    connections: number
  }
  api: {
    status: 'healthy' | 'warning' | 'error'
    uptime: number
    requestsPerMinute: number
  }
  storage: {
    used: number
    total: number
    percentage: number
  }
  activeUsers: {
    total: number
    guru: number
    santri: number
    admin: number
  }
}

export function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Update setiap 30 detik
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      // Simulasi data - dalam implementasi nyata akan fetch dari API monitoring
      const mockData: SystemHealth = {
        database: {
          status: 'healthy',
          responseTime: 45,
          connections: 12
        },
        api: {
          status: 'healthy',
          uptime: 99.8,
          requestsPerMinute: 156
        },
        storage: {
          used: 2.4,
          total: 10,
          percentage: 24
        },
        activeUsers: {
          total: 89,
          guru: 12,
          santri: 74,
          admin: 3
        }
      }
      
      setSystemHealth(mockData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching system health:', error)
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!systemHealth) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700">Gagal memuat status sistem</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Health */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Server className="w-5 h-5" />
            Status Sistem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-sm">Database</p>
                <p className="text-xs text-slate-600">{systemHealth.database.responseTime}ms response</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.database.status)}
              <Badge className={getStatusColor(systemHealth.database.status)}>
                {systemHealth.database.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-sm">API Server</p>
                <p className="text-xs text-slate-600">{systemHealth.api.uptime}% uptime</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.api.status)}
              <Badge className={getStatusColor(systemHealth.api.status)}>
                {systemHealth.api.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-sm">Security</p>
                <p className="text-xs text-slate-600">All systems secure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">
                secure
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Database className="w-5 h-5" />
            Penggunaan Resource
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Storage</span>
              <span className="text-sm text-slate-600">
                {systemHealth.storage.used}GB / {systemHealth.storage.total}GB
              </span>
            </div>
            <Progress value={systemHealth.storage.percentage} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">{systemHealth.storage.percentage}% digunakan</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Database Connections</span>
              <span className="text-sm text-slate-600">{systemHealth.database.connections}/50</span>
            </div>
            <Progress value={(systemHealth.database.connections / 50) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">API Requests</span>
              <span className="text-sm text-slate-600">{systemHealth.api.requestsPerMinute}/min</span>
            </div>
            <div className="text-xs text-slate-500">Current load: Normal</div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5" />
            Pengguna Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-slate-800">{systemHealth.activeUsers.total}</p>
            <p className="text-sm text-slate-600">Total pengguna online</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-800">{systemHealth.activeUsers.admin}</p>
              <p className="text-xs text-blue-600">Admin</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-800">{systemHealth.activeUsers.guru}</p>
              <p className="text-xs text-green-600">Guru</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-semibold text-purple-800">{systemHealth.activeUsers.santri}</p>
              <p className="text-xs text-purple-600">Santri</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Template ujian baru dibuat</p>
                <p className="text-xs text-slate-500">2 menit yang lalu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Raport di-generate</p>
                <p className="text-xs text-slate-500">5 menit yang lalu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Ujian MHQ selesai</p>
                <p className="text-xs text-slate-500">8 menit yang lalu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Backup otomatis</p>
                <p className="text-xs text-slate-500">15 menit yang lalu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}