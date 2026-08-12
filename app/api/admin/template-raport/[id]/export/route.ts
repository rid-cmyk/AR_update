import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.templateRaport.findUnique({
      where: { id: parseInt(id) },
      include: {
        tahunAjaran: {
          select: { namaLengkap: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template raport tidak ditemukan' },
        { status: 404 }
      )
    }

    const exportData = {
      namaTemplate: template.namaTemplate,
      namaLembaga: template.namaLembaga,
      logoLembaga: template.logoLembaga,
      alamatLembaga: template.alamatLembaga,
      headerKopSurat: template.headerKop,
      footerRaport: template.footerKop,
      tandaTanganKepala: template.tandaTanganKepala,
      namaKepala: template.namaKepala,
      jabatanKepala: template.jabatanKepala,
      formatTampilan: {
        tampilanGrafik: template.tampilanGrafik,
        tampilanRanking: template.tampilanRanking,
        catatanTemplate: template.catatanTemplate
      },
      tahunAjaran: template.tahunAjaran?.namaLengkap || null
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="template-raport-${template.id}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting template raport:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor template raport' },
      { status: 500 }
    )
  }
}
