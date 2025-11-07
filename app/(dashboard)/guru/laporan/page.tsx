'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLaporanUjian } from '@/components/guru/laporan/DashboardLaporanUjian'
import { 
  BarChart3, FileText, Users, TrendingUp, 
  Download, Calendar, BookOpen, Award
} from 'lucide-react'

export default function GuruLaporanPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Laporan Guru
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard komprehensif untuk analisis dan pelaporan aktivitas pembelajaran
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ujian</p>
                <p className="text-2xl font-bold text-blue-600">156</p>
                <p className="text-xs text-gray-500 mt-1">Bulan ini</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-green-600">84.5</p>
                <p className="text-xs text-gray-500 mt-1">↑ 2.3 dari bulan lalu</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Santri Aktif</p>
                <p className="text-2xl font-bold text-purple-600">48</p>
                <p className="text-xs text-gray-500 mt-1">3 halaqah</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-orange-600">92%</p>
                <p className="text-xs text-gray-500 mt-1">Target semester</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ujian" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Laporan Ujian
          </TabsTrigger>
          <TabsTrigger value="santri" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Progress Santri
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardLaporanUjian />
        </TabsContent>

        <TabsContent value="ujian" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Laporan Detail Ujian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Laporan Detail Ujian</h3>
                <p className="text-gray-500 mb-4">
                  Fitur ini akan menampilkan laporan detail untuk setiap ujian yang telah dilakukan.
                </p>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Pilih Periode
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="santri" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Progress Individual Santri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Santri</h3>
                <p className="text-gray-500 mb-4">
                  Fitur ini akan menampilkan progress individual setiap santri dalam pembelajaran.
                </p>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Lihat Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <FileText className="mx-auto h-8 w-8 text-blue-500 mb-3" />
                      <h3 className="font-medium mb-2">Export Laporan Ujian</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Export data ujian dalam format CSV atau Excel
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Users className="mx-auto h-8 w-8 text-green-500 mb-3" />
                      <h3 className="font-medium mb-2">Export Data Santri</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Export data progress santri dan nilai
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-purple-500 mb-3" />
                      <h3 className="font-medium mb-2">Export Analisis</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Export laporan analisis dan statistik
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Calendar className="mx-auto h-8 w-8 text-orange-500 mb-3" />
                      <h3 className="font-medium mb-2">Export Jadwal</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Export jadwal ujian dan kegiatan
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export iCal
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Tips Export Data</h4>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Gunakan filter periode untuk data yang lebih spesifik</li>
                          <li>Format CSV cocok untuk analisis di Excel atau Google Sheets</li>
                          <li>Format PDF cocok untuk laporan resmi dan presentasi</li>
                          <li>Data akan diexport sesuai dengan permission akun Anda</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}