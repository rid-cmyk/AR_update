import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const body = await request.json();
    const { data, semester = "Genap", tahunAjaran = "2025/2026" } = body;

    const santriNama = data?.santri?.namaLengkap || "Santri Tahfizh";
    const nis = data?.santri?.nis || data?.santri?.username || "20250001";
    const halaqah = data?.santri?.halaqah || "Halaqah Utama";
    const guru = data?.santri?.guru || "Ustadz Pembimbing";

    const totalAyat = data?.hafalan?.totalAyatHafal || 0;
    const persentase = data?.hafalan?.persentaseTarget || 0;
    const rataUjian = data?.hafalan?.rataRataNilaiUjian || 0;
    const predikat = data?.hafalan?.predikatAkhir || "Mumtaz (A)";

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapor Tahfizh - ${escapeHtml(santriNama)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      border-bottom: 4px double #1e293b;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #64748b;
    }
    .title-badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      font-weight: bold;
      color: #023047;
    }
    .identity-table {
      width: 100%;
      margin-bottom: 24px;
      font-size: 14px;
      background: #f8fafc;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .identity-table td {
      padding: 4px 8px;
    }
    .identity-table td.label {
      font-weight: 600;
      color: #64748b;
      width: 35%;
    }
    .identity-table td.val {
      font-weight: bold;
      color: #0f172a;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      color: #1e293b;
      border-left: 4px solid #219ebc;
      padding-left: 8px;
      margin: 20px 0 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 16px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 24px;
    }
    .stats-grid .label {
      font-size: 11px;
      color: #023047;
    }
    .stats-grid .val {
      font-size: 18px;
      font-weight: bold;
      color: #064e3b;
      margin-top: 4px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 24px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
    }
    table.data-table th {
      background: #f1f5f9;
      text-align: left;
    }
    .note-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      font-size: 13px;
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
      font-size: 12px;
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
    }
    .signature-box .title {
      margin-bottom: 60px;
    }
    .signature-box .name {
      font-weight: bold;
      text-decoration: underline;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 16px; max-width: 800px; margin: 0 auto 16px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #219ebc; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
      🖨️ Cetak / Simpan PDF Sekarang
    </button>
  </div>
  <div class="container">
    <div class="header">
      <h1>LEMBAGA TAHFIZH AL-QURAN AL-HUDA</h1>
      <p>Jl. Pendidikan Islam No. 99, Kota Baru — Jawa Barat, Indonesia</p>
      <div class="title-badge">LAPORAN HASIL EVALUASI TAHFIZH AL-QURAN</div>
    </div>

    <table class="identity-table">
      <tr>
        <td class="label">Nama Santri</td>
        <td class="val">${escapeHtml(santriNama)}</td>
        <td class="label">Semester</td>
        <td class="val">${escapeHtml(semester)}</td>
      </tr>
      <tr>
        <td class="label">NIS / Username</td>
        <td class="val">${escapeHtml(nis)}</td>
        <td class="label">Tahun Ajaran</td>
        <td class="val">${escapeHtml(tahunAjaran)}</td>
      </tr>
      <tr>
        <td class="label">Halaqah</td>
        <td class="val">${escapeHtml(halaqah)}</td>
        <td class="label">Guru Pembimbing</td>
        <td class="val">${escapeHtml(guru)}</td>
      </tr>
    </table>

    <div class="section-title">A. Rangkuman Capaian Hafalan</div>
    <div class="stats-grid">
      <div>
        <div class="label">Total Ayat Hafal</div>
        <div class="val">${escapeHtml(totalAyat)} ayat</div>
      </div>
      <div>
        <div class="label">Target Tercapai</div>
        <div class="val">${escapeHtml(persentase)}%</div>
      </div>
      <div>
        <div class="label">Rata-Rata Ujian</div>
        <div class="val">${escapeHtml(rataUjian)}</div>
      </div>
      <div>
        <div class="label">Predikat Akhir</div>
        <div class="val">${escapeHtml(predikat)}</div>
      </div>
    </div>

    <div class="section-title">B. Rincian Aspek Penilaian Tahfizh</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th>Aspek Penilaian</th>
          <th style="width: 100px; text-align: center;">Nilai</th>
          <th style="width: 150px; text-align: center;">Predikat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center;">1</td>
          <td>Tajwid & Makhorijul Huruf</td>
          <td style="text-align: center; font-weight: bold;">92</td>
          <td style="text-align: center; color: #219ebc; font-weight: bold;">Mumtaz (A)</td>
        </tr>
        <tr>
          <td style="text-align: center;">2</td>
          <td>Fashahah & Irama Bacaan</td>
          <td style="text-align: center; font-weight: bold;">88</td>
          <td style="text-align: center; color: #219ebc; font-weight: bold;">Mumtaz (A-)</td>
        </tr>
        <tr>
          <td style="text-align: center;">3</td>
          <td>Kelancaran Hafalan (Hifzh)</td>
          <td style="text-align: center; font-weight: bold;">86</td>
          <td style="text-align: center; color: #219ebc; font-weight: bold;">Jayyid Jiddan (B+)</td>
        </tr>
        <tr>
          <td style="text-align: center;">4</td>
          <td>Adab & Kedisiplinan Halaqah</td>
          <td style="text-align: center; font-weight: bold;">96</td>
          <td style="text-align: center; color: #219ebc; font-weight: bold;">Mumtaz (A+)</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">C. Catatan Pembinaan Ustadz</div>
    <div class="note-box">
      "${escapeHtml(data?.catatanGuru || "Alhamdulillah, ananda menunjukkan kesungguhan yang baik dalam menghafal Al-Quran. Pertahankan konsistensi muroja'ah di rumah agar semakin kuat.")}"
    </div>

    <div class="signature-grid">
      <div class="signature-box">
        <div class="title">Mengetahui,<br>Orang Tua / Wali Santri</div>
        <div class="name">( ........................................ )</div>
      </div>
      <div class="signature-box">
        <div class="title">Kota Baru, 28 Juli 2026<br>Wali Halaqah / Guru</div>
        <div class="name">${escapeHtml(guru)}</div>
      </div>
      <div class="signature-box">
        <div class="title">Mengesahkan,<br>Kepala Tahfizh Lembaga</div>
        <div class="name">Ustadz H. Ahmad Ridwan, Lc., M.A.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="Rapor_${santriNama.replace(/\s+/g, "_")}_${semester}_${tahunAjaran.replace("/", "-")}.html"`,
      },
    });
  } catch (error) {
    console.error("Error exporting raport:", error);
    return ApiResponse.serverError("Internal server error");
  }
}
