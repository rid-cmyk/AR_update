'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { 
  BookOpen, Users, TrendingUp, Award, 
  Download, Filter, Calendar, Eye
} from 'lucide-react'

interface LaporanUjianData {
  summary: {
    totalUjian: number
    nilaiRataRata: number
    periode: string
    jenisUjian: string
    halaqah: string
  }
  byJenisUjian: Record<string, {
    count: number
    totalNilai: number
    rataRata: number
  }>
  byHalaqah: Record<string, {
    count: number
    totalNilai: number
    rataRata: number
    santriCount: number
  }>
  performanceCategories: {
    excellent: number
    good: number
    average: number
    needsImprovement: number
  }
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

export function DashboardLaporanUjian() {
  const [laporanData, setLaporanData] = useState<LaporanUjianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    periode: 'bulan-ini',
    jenisUjian: '',
    halaqah: ''
  })

  useEffect(() => {
    fetchLaporanData()
  }, [filters])

  const fetchLaporanData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        format: 'summary',
        ...filters
      })
      
      const response = await fetch(`/api/guru/laporan-ujian?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setLaporanData(result.data)
      }
    } catch (error) {
      console.error('Error fetching laporan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'export',
        ...filters
      })
      
      const response = await fetch(`/api/guru/laporan-ujian?${params}`)
      const result = await response.json()
      
      if (result.success) {
        // Convert to CSV and download
        const csvContent = convertToCSV(result.data)
        downloadCSV(csvContent, `laporan-ujian-${filters.periode}.csv`)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Dashboard Laporan Ujian</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!laporanData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data laporan</h3>
        <p className="text-gray-500">Belum ada data ujian untuk periode yang dipilih.</p>
      </div>
    )
  }

  // Prepare chart data
  const jenisUjianChartData = Object.entries(laporanData.byJenisUjian).map(([jenis, data]) => ({
    name: jenis.toUpperCase(),
    count: data.count,
    rataRata: Math.round(data.rataRata * 100) / 100
  }))

  const halaqahChartData = Object.entries(laporanData.byHalaqah).map(([halaqah, data]) => ({
    name: halaqah,
    count: data.count,
    rataRata: Math.round(data.rataRata * 100) / 100,
    santri: data.santriCount
  }))

  const performanceData = [
    { name: 'Excellent (≥90)', value: laporanData.performanceCategories.excellent, color: '#10b981' },
    { name: 'Good (80-89)', value: laporanData.performanceCategories.good, color: '#3b82f6' },
    { name: 'Average (70-79)', value: laporanData.performanceCategories.average, color: '#f59e0b' },
    { name: 'Needs Improvement (<70)', value: laporanData.performanceCategories.needsImprovement, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">📊 Dashboard Laporan Ujian</h1>
          <p className="text-gray-600">Analisis komprehensif hasil ujian santri</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Periode</label>
              <Select value={filters.periode} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, periode: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
                  <SelectItem value="semester-ini">Semester Ini</SelectItem>
                  <SelectItem value="tahun-ini">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Jenis Ujian</label>
              <Select value={filters.jenisUjian} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, jenisUjian: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Jenis</SelectItem>
                  <SelectItem value="tasmi">Tasmi'</SelectItem>
                  <SelectItem value="tahfidz">Tahfidz</SelectItem>
                  <SelectItem value="mhq">MHQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Halaqah</label>
              <Select value={filters.halaqah} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, halaqah: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Halaqah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Halaqah</SelectItem>
                  <SelectItem value="umar">Halaqah Umar</SelectItem>
                  <SelectItem value="ali">Halaqah Ali</SelectItem>
                  <SelectItem value="abu-bakar">Halaqah Abu Bakar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ujian</p>
                <p className="text-2xl font-bold">{laporanData.summary.totalUjian}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nilai Rata-rata</p>
                <p className="text-2xl font-bold">{laporanData.summary.nilaiRataRata}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Santri Aktif</p>
                <p className="text-2xl font-bold">
                  {Object.values(laporanData.byHalaqah).reduce((sum, h) => sum + h.santriCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Periode</p>
                <p className="text-lg font-bold capitalize">{laporanData.summary.periode.replace('-', ' ')}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Performa Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ujian by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Ujian per Jenis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jenisUjianChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah Ujian" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Halaqah Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performa per Halaqah</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={halaqahChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Jumlah Ujian" />
              <Bar dataKey="rataRata" fill="#10b981" name="Rata-rata Nilai" />
              <Bar dataKey="santri" fill="#f59e0b" name="Jumlah Santri" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Performa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{category.value}</span>
                  <div className="w-32">
                    <Progress 
                      value={(category.value / laporanData.summary.totalUjian) * 100} 
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round((category.value / laporanData.summary.totalUjian) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}