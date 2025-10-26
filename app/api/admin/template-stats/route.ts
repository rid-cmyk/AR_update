import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super-admin'])
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Get statistics for all templates
      const [
        totalTahunAkademik,
      totalTemplateUjian,
      totalTemplateRaport,
      totalKomponenPenilaian
    ] = await Promise.all([
      prisma.tahunAjaran.count(),
      prisma.templateUjian.count(),
      prisma.templateRaport.count(),
      prisma.komponenPenilaian.count()
    ])

    // Count unique jenis ujian from template ujian
    const uniqueJenisUjian = await prisma.templateUjian.findMany({
      select: { jenisUjian: true },
      distinct: ['jenisUjian']
    })

      return NextResponse.json({
        totalTahunAkademik,
        totalJenisUjian: uniqueJenisUjian.length,
        totalTemplateUjian,
        totalTemplateRaport,
        totalKomponenPenilaian
      })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Template stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}