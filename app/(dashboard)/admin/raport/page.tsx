'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  BarChart3, 
  Users, 
  Download,
  Settings
} from 'lucide-react'
import { GenerateRaportPDF } from '@/components/admin/raport/GenerateRaportPDF'

import LayoutApp from '@/components/layout/LayoutApp'

export default function RaportPage() {
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <LayoutApp>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Raport</h1>
          <p className="text-gray-600 mt-2">
            Generate dan kelola raport santri dengan template yang telah dibuat
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Settings className="w-4 h-4 mr-2" />
          Admin Panel
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="generate" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Generate Raport
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Riwayat Raport
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4" />
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <GenerateRaportPDF />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Riwayat Generate Raport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Fitur riwayat raport akan segera tersedia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Raport</p>
                    <p className="text-2xl font-bold text-blue-800">156</p>
                    <p className="text-xs text-blue-600">Bulan ini</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Santri Lulus</p>
                    <p className="text-2xl font-bold text-green-800">142</p>
                    <p className="text-xs text-green-600">91% tingkat kelulusan</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold text-yellow-800">84.5</p>
                    <p className="text-xs text-yellow-600">Naik 2.3 poin</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Download</p>
                    <p className="text-2xl font-bold text-purple-800">1,234</p>
                    <p className="text-xs text-purple-600">File PDF</p>
                  </div>
                  <Download className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sangat Baik (90-100)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Baik (80-89)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cukup (70-79)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kurang (&lt;70)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performa per Halaqah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { nama: 'Halaqah Al-Fatihah', rata: 87.5, santri: 25 },
                    { nama: 'Halaqah Al-Baqarah', rata: 84.2, santri: 28 },
                    { nama: 'Halaqah Ali Imran', rata: 89.1, santri: 22 },
                    { nama: 'Halaqah An-Nisa', rata: 82.8, santri: 26 }
                  ].map((halaqah, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{halaqah.nama}</p>
                        <p className="text-xs text-gray-600">{halaqah.santri} santri</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{halaqah.rata}</p>
                        <p className="text-xs text-gray-600">Rata-rata</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </LayoutApp>
  )
}