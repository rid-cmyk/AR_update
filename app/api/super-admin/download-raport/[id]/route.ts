import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { RaportService } from '@/lib/services/raport.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (!user || error) return ApiResponse.unauthorized(error || "Unauthorized")

    const { id } = await params
    const raport = await RaportService.getRaportWithRelations(parseInt(id))

    const nama = raport.santri.namaLengkap
    const halaqah = raport.santri.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'Halaqah Utama'
    const htmlDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rapor Tahfizh - ${nama}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #0f172a; background: #f8fafc; }
    .card { background: #fff; border: 2px solid #1e293b; padding: 32px; max-width: 800px; margin: 0 auto; border-radius: 8px; }
    h1 { text-align: center; margin: 0; text-transform: uppercase; font-size: 22px; }
    .sub { text-align: center; color: #219ebc; font-weight: bold; margin: 6px 0 24px; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; }
    .btn-print { padding: 10px 20px; background: #219ebc; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
    @media print { body { padding: 0; background: #fff; } .card { border: none; padding: 0; max-width: 100%; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; max-width: 800px; margin: 0 auto 16px;">
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>
  <div class="card">
    <h1>${raport.templateRaport?.namaLembaga || "LEMBAGA TAHFIZH AL-QURAN"}</h1>
    <div class="sub">LAPORAN HASIL EVALUASI TAHFIZH - ${raport.tahunAjaran.namaLengkap}</div>
    <p><strong>Nama Santri:</strong> ${nama}</p>
    <p><strong>NIS/Username:</strong> ${raport.santri.username}</p>
    <p><strong>Halaqah:</strong> ${halaqah}</p>
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
        'Content-Disposition': `attachment; filename="raport-${nama}-${raport.tahunAjaran.namaLengkap}.html"`
      }
    })
  } catch (error: any) {
    if (error?.name === 'RaportServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError()
  }
}
