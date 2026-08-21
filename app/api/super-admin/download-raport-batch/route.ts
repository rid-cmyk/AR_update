import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { RaportService } from '@/lib/services/raport.service'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (!user || error) return ApiResponse.unauthorized(error || "Unauthorized")

    const body = await request.json()
    const { raportIds, tahunAjaranId } = body

    const raportList = await RaportService.getRaportBatch(raportIds, tahunAjaranId)

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
    .sub { text-align: center; color: #219ebc; font-weight: bold; margin: 8px 0 24px; }
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
  } catch (error: any) {
    if (error?.name === 'RaportServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError()
  }
}
