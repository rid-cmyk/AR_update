import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

async function getSystemStatus() {
  const [
    userCount,
    halaqahCount,
    hafalanCount,
    ujianCount,
    absensiCount,
    raportCount,
    templateUjianCount,
    templateRaportCount,
    backupRecords,
    aktifTahunAjaran
  ] = await Promise.all([
    prisma.user.count(),
    prisma.halaqah.count(),
    prisma.hafalan.count(),
    prisma.ujianSantri.count(),
    prisma.absensi.count(),
    prisma.raportSantri.count(),
    prisma.templateUjian.count(),
    prisma.templateRaport.count(),
    prisma.backup.findMany({ orderBy: { tanggalBackup: 'desc' }, take: 1 }),
    prisma.tahunAjaran.findFirst({ where: { isActive: true } })
  ])

  return {
    status: 'healthy',
    database: {
      connected: true,
      totalRecords: userCount + halaqahCount + hafalanCount + ujianCount + absensiCount + raportCount,
    },
    summary: {
      totalUsers: userCount,
      totalHalaqah: halaqahCount,
      totalHafalan: hafalanCount,
      totalUjian: ujianCount,
      totalAbsensi: absensiCount,
    },
    academicYear: aktifTahunAjaran ? {
      nama: aktifTahunAjaran.namaLengkap,
      semester: aktifTahunAjaran.semester === 'S1' ? 'Ganjil' : 'Genap',
      isActive: aktifTahunAjaran.isActive,
    } : null,
    templates: {
      ujian: templateUjianCount,
      raport: templateRaportCount,
      total: templateUjianCount + templateRaportCount,
    },
    backup: backupRecords.length > 0 ? {
      lastBackup: backupRecords[0].tanggalBackup.toISOString(),
      fileName: backupRecords[0].namaFile,
    } : null,
    raport: raportCount,
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin'])
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await getSystemStatus()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      status: 'unhealthy',
      database: { connected: false, totalRecords: 0 },
      error: 'Gagal mengambil data sistem',
      lastUpdated: new Date().toISOString(),
    }, { status: 500 })
  }
}
