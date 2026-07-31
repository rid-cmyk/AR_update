import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { raportIds, tahunAjaranId } = body

    if (!raportIds || !Array.isArray(raportIds) || raportIds.length === 0) {
      return NextResponse.json({ error: 'Raport IDs harus diisi' }, { status: 400 })
    }

    const raportList = await prisma.raportSantri.findMany({
      where: {
        santriId: { in: raportIds },
        tahunAjaranId: tahunAjaranId
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        templateRaport: true,
        tahunAjaran: true
      }
    })

    if (raportList.length === 0) {
      return NextResponse.json({ error: 'Tidak ada raport yang ditemukan' }, { status: 404 })
    }

    const zip = new JSZip()
    const raportFolder = zip.folder("Raport_Santri") || zip

    raportList.forEach((raport) => {
      const santriNama = raport.santri.namaLengkap
      const username = raport.santri.username
      const tahun = raport.tahunAjaran.namaLengkap
      const htmlDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rapor Tahfizh - ${santriNama}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #1e293b; }
    .box { border: 2px solid #1e293b; padding: 24px; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; margin: 0; text-transform: uppercase; }
    .sub { text-align: center; color: #059669; font-weight: bold; margin: 8px 0 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f1f5f9; text-align: left; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${raport.templateRaport?.namaLembaga || "LEMBAGA TAHFIZH AL-QURAN"}</h1>
    <div class="sub">LAPORAN HASIL EVALUASI TAHFIZH - ${tahun}</div>
    <p><strong>Nama Santri:</strong> ${santriNama} (${username})</p>
    <p><strong>Nilai Rata-Rata:</strong> ${raport.nilaiRataRata || 0}</p>
    <p><strong>Ranking:</strong> ${raport.ranking || '-'}</p>
    <p><strong>Status Kelulusan:</strong> ${raport.statusKelulusan || 'Lulus'}</p>
    <p><strong>Catatan Guru:</strong> "${raport.catatanGuru || 'Alhamdulillah, tingkatkan terus murajaah.'}"</p>
  </div>
</body>
</html>`
      raportFolder.file(`Rapor_${santriNama.replace(/\s+/g, '_')}_${tahun.replace('/', '-')}.html`, htmlDoc)
    })

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="raport-batch-${tahunAjaranId}.zip"`
      }
    })

  } catch (error) {
    console.error('Error creating batch download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}