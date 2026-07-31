import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const raportId = parseInt(id)
    if (isNaN(raportId)) {
      return NextResponse.json({ error: 'ID raport tidak valid' }, { status: 400 })
    }

    const raport = await prisma.raportSantri.findUnique({
      where: { id: raportId },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true,
            HalaqahSantri: {
              include: {
                halaqah: {
                  select: {
                    namaHalaqah: true
                  }
                }
              }
            }
          }
        },
        templateRaport: true,
        tahunAjaran: true
      }
    })

    if (!raport) {
      return NextResponse.json(
        { error: 'Raport tidak ditemukan' },
        { status: 404 }
      )
    }

    const htmlDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rapor Tahfizh - ${raport.santri.namaLengkap}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #0f172a; background: #f8fafc; }
    .card { background: #fff; border: 2px solid #1e293b; padding: 32px; max-width: 800px; margin: 0 auto; border-radius: 8px; }
    h1 { text-align: center; margin: 0; text-transform: uppercase; font-size: 22px; }
    .sub { text-align: center; color: #059669; font-weight: bold; margin: 6px 0 24px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; }
    .btn-print { padding: 10px 20px; background: #059669; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
    @media print {
      body { padding: 0; background: #fff; }
      .card { border: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; max-width: 800px; margin: 0 auto 16px;">
    <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  </div>
  <div class="card">
    <h1>${raport.templateRaport?.namaLembaga || "LEMBAGA TAHFIZH AL-QURAN"}</h1>
    <div class="sub">LAPORAN HASIL EVALUASI TAHFIZH - ${raport.tahunAjaran.namaLengkap}</div>
    <p><strong>Nama Santri:</strong> ${raport.santri.namaLengkap}</p>
    <p><strong>NIS/Username:</strong> ${raport.santri.username}</p>
    <p><strong>Halaqah:</strong> ${raport.santri.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'Halaqah Utama'}</p>
    <p><strong>Nilai Rata-rata:</strong> ${raport.nilaiRataRata || 0}</p>
    <p><strong>Ranking:</strong> ${raport.ranking || '-'}</p>
    <p><strong>Status Kelulusan:</strong> ${raport.statusKelulusan || 'Lulus'}</p>
    <p><strong>Catatan Guru:</strong> "${raport.catatanGuru || 'Alhamdulillah, tingkatkan terus murajaah.'}"</p>
  </div>
</body>
</html>`

    return new NextResponse(htmlDoc, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="raport-${raport.santri.namaLengkap}-${raport.tahunAjaran.namaLengkap}.html"`
      }
    })

  } catch (error) {
    console.error('Error downloading raport:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}