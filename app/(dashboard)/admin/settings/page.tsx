'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Database, 
  Shield, 
  Server, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SystemSettings {
  appName: string
  appDescription: string
  contactEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  maxUsers: number
  sessionTimeout: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'Ar-Hapalan',
    appDescription: 'Sistem Manajemen Hafalan Al-Quran',
    contactEmail: 'admin@arhapalan.com',
    maintenanceMode: false,
    allowRegistration: true,
    maxUsers: 1000,
    sessionTimeout: 30
  })
  const [loading, setLoading] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 245,
    activeUsers: 89,
    totalUjian: 1250,
    totalRaport: 340,
    dbSize: '2.4 GB',
    lastBackup: '2 jam yang lalu'
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
    fetchSystemStats()
  }, [])

  const fetchSettings = async () => {
    try {
      // Simulasi fetch settings dari API
      // const response = await fetch('/api/admin/settings')
      // const data = await response.json()
      // setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      // Simulasi fetch system stats dari API
      // const response = await fetch('/api/admin/system-stats')
      // const data = await response.json()
      // setSystemStats(data)
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulasi save settings ke API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulasi delay
      
      toast({
        title: "Berhasil",
        description: "Pengaturan sistem berhasil disimpan"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan sistem",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan dan konfigurasi sistem
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Sistem</p>
                <p className="font-bold text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-bold text-blue-600">{systemStats.dbSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Keamanan</p>
                <p className="font-bold text-purple-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backup Terakhir</p>
                <p className="font-bold text-orange-600">{systemStats.lastBackup}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>

        {/* Tab Pengaturan Umum */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pengaturan Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nama Aplikasi</Label>
                  <Input
                    id="appName"
                    value={settings.appName}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                    placeholder="Nama aplikasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Kontak</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appDescription">Deskripsi Aplikasi</Label>
                <Textarea
                  id="appDescription"
                  value={settings.appDescription}
                  onChange={(e) => handleInputChange('appDescription', e.target.value)}
                  placeholder="Deskripsi singkat tentang aplikasi"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Keamanan */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pengaturan Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan untuk mencegah akses pengguna saat maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Izinkan Registrasi</Label>
                  <p className="text-sm text-muted-foreground">
                    Izinkan pengguna baru untuk mendaftar
                  </p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maksimal Pengguna</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={settings.maxUsers}
                    onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout Sesi (menit)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sistem */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Versi Aplikasi</Label>
                  <p className="text-lg font-bold">v2.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Environment</Label>
                  <Badge variant="default">Production</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Terakhir Update</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Komponen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Database PostgreSQL', status: 'healthy', color: 'text-green-600' },
                  { name: 'File Storage', status: 'healthy', color: 'text-green-600' },
                  { name: 'Email Service', status: 'healthy', color: 'text-green-600' },
                  { name: 'Backup Service', status: 'healthy', color: 'text-green-600' }
                ].map((component) => (
                  <div key={component.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{component.name}</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${component.color}`} />
                      <span className={`text-sm ${component.color}`}>Healthy</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Statistik */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pengguna</p>
                    <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                    <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ujian</p>
                    <p className="text-2xl font-bold">{systemStats.totalUjian}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raport</p>
                    <p className="text-2xl font-bold">{systemStats.totalRaport}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Sistem (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Grafik aktivitas akan ditampilkan di sini</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}