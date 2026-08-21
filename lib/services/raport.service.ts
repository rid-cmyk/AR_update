import { prisma } from '@/lib/database/prisma';
import { calculatePredikat } from '@/lib/utils/hafalanAssessment';

interface RaportSantriEntry {
  santri: { id: number; namaLengkap: string; username: string };
  totalAyatHafal: number;
  targetTercapai: number;
  rataRataNilaiUjian: number;
  statusAkhir: string;
}

interface GenerateRaportInput {
  santriId: number;
  templateRaportId: number;
  tahunAjaranId: number;
  userId: number;
}

interface GenerateRaportResult {
  santriId: number;
  templateRaportId: number;
  tahunAjaranId: number;
  nilaiRataRata: number;
  ranking: number;
  statusKelulusan: string;
  raportId: number;
}

interface ExportRaportParams {
  santriNama: string;
  nis: string;
  halaqah: string;
  guru: string;
  totalAyat: number;
  persentase: number;
  rataUjian: number;
  predikat: string;
  catatanGuru?: string;
}

export class RaportServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'RaportServiceError';
  }
}

export class RaportService {
  private static RAPORT_INCLUDE = {
    santri: {
      select: {
        namaLengkap: true,
        username: true,
        HalaqahSantri: {
          include: { halaqah: { select: { namaHalaqah: true } } }
        }
      }
    },
    templateRaport: true,
    tahunAjaran: true
  } as const;

  static async getRaportWithRelations(raportId: number): Promise<any> {
    if (isNaN(raportId)) throw new RaportServiceError('ID raport tidak valid', 400);
    const raport = await prisma.raportSantri.findUnique({
      where: { id: raportId },
      include: this.RAPORT_INCLUDE as any
    });
    if (!raport) throw new RaportServiceError('Raport tidak ditemukan', 404);
    return raport;
  }

  static async getRaportBatch(raportIds: number[], tahunAjaranId: number): Promise<any[]> {
    if (!raportIds || raportIds.length === 0) throw new RaportServiceError('Raport IDs harus diisi', 400);
    const raportList = await prisma.raportSantri.findMany({
      where: { santriId: { in: raportIds }, tahunAjaranId },
      include: { santri: { select: { namaLengkap: true, username: true } }, templateRaport: true, tahunAjaran: true }
    });
    if (raportList.length === 0) throw new RaportServiceError('Tidak ada raport yang ditemukan', 404);
    return raportList;
  }

  /**
   * Fetch aggregated raport data for all santri in a halaqah+semester.
   */
  static async fetchRaportData(
    halaqahId: number,
    semester: string,
    tahunAjaran: string
  ): Promise<RaportSantriEntry[]> {
    const startYear = parseInt(tahunAjaran.split('/')[0], 10);
    const resolvedSemester = isNaN(startYear)
      ? null
      : await prisma.semester.findFirst({
          where: {
            tahunAjaran: { tahunMulai: startYear },
            semesterUrutan: semester === 'S1' ? 1 : 2,
          },
          select: { id: true },
        });

    if (!resolvedSemester) {
      return [];
    }

    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { halaqahId, semesterId: resolvedSemester.id },
      include: {
        santri: {
          select: { id: true, namaLengkap: true, username: true },
        },
      },
    });

    if (halaqahSantri.length === 0) {
      return [];
    }

    const santriIds = halaqahSantri.map((hs) => hs.santriId);

    const [allHafalan, allTargets, allUjian] = await Promise.all([
      prisma.hafalan.findMany({
        where: { santriId: { in: santriIds } },
        select: { santriId: true, ayatMulai: true, ayatSelesai: true },
      }),
      prisma.targetHafalan.findMany({
        where: { santriId: { in: santriIds } },
        select: { santriId: true, ayatTarget: true },
      }),
      prisma.ujianSantri.findMany({
        where: {
          santriId: { in: santriIds },
          statusUjian: { in: ['selesai', 'diverifikasi'] },
        },
        select: { santriId: true, nilaiAkhir: true },
      }),
    ]);

    const hafalanBySantri = new Map<number, typeof allHafalan>();
    for (const h of allHafalan) {
      if (!hafalanBySantri.has(h.santriId)) hafalanBySantri.set(h.santriId, []);
      hafalanBySantri.get(h.santriId)!.push(h);
    }

    const targetsBySantri = new Map<number, typeof allTargets>();
    for (const t of allTargets) {
      if (!targetsBySantri.has(t.santriId)) targetsBySantri.set(t.santriId, []);
      targetsBySantri.get(t.santriId)!.push(t);
    }

    const ujianBySantri = new Map<number, typeof allUjian>();
    for (const u of allUjian) {
      if (!ujianBySantri.has(u.santriId)) ujianBySantri.set(u.santriId, []);
      ujianBySantri.get(u.santriId)!.push(u);
    }

    return halaqahSantri.map((hs) => {
      const santriId = hs.santriId;

      const hafalan = hafalanBySantri.get(santriId) || [];
      const totalAyatHafal = hafalan.reduce(
        (sum, h) => sum + h.ayatSelesai - h.ayatMulai + 1,
        0
      );

      const targets = targetsBySantri.get(santriId) || [];
      const totalTarget = targets.reduce((sum, t) => sum + t.ayatTarget, 0);
      const targetTercapai =
        totalTarget > 0 ? Math.round((totalAyatHafal / totalTarget) * 100) : 0;

      const ujian = ujianBySantri.get(santriId) || [];
      const rataRataNilaiUjian =
        ujian.length > 0
          ? ujian.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) /
            ujian.length
          : 0;

      let statusAkhir = 'Merah';
      if (targetTercapai >= 80 && rataRataNilaiUjian >= 80) {
        statusAkhir = 'Hijau';
      } else if (targetTercapai >= 60 || rataRataNilaiUjian >= 60) {
        statusAkhir = 'Kuning';
      }

      return {
        santri: hs.santri,
        totalAyatHafal,
        targetTercapai,
        rataRataNilaiUjian: Math.round(rataRataNilaiUjian * 100) / 100,
        statusAkhir,
      };
    });
  }

  /**
   * Generate or update a raport for a single santri in a given tahun ajaran.
   */
  static async generateRaport(
    input: GenerateRaportInput
  ): Promise<GenerateRaportResult> {
    const { santriId, templateRaportId, tahunAjaranId, userId } = input;

    const [santri, template, tahunAjaran] = await Promise.all([
      prisma.user.findUnique({ where: { id: santriId } }),
      prisma.templateRaport.findUnique({ where: { id: templateRaportId } }),
      prisma.tahunAjaran.findUnique({ where: { id: tahunAjaranId } }),
    ]);

    if (!santri || !template || !tahunAjaran) {
      throw new Error('Data tidak ditemukan');
    }

    const ujianData = await prisma.ujianSantri.findMany({
      where: {
        santriId,
        tahunAjaranId,
        statusUjian: { in: ['selesai', 'diverifikasi'] },
      },
      orderBy: { tanggalUjian: 'desc' },
    });

    const nilaiRataRata =
      ujianData.length > 0
        ? Math.round(
            ujianData.reduce(
              (sum, ujian) => sum + (ujian.nilaiAkhir || 0),
              0
            ) / ujianData.length
          )
        : 0;

    const allSantriNilai = await prisma.ujianSantri.groupBy({
      by: ['santriId'],
      where: {
        tahunAjaranId,
        statusUjian: { in: ['selesai', 'diverifikasi'] },
      },
      _avg: { nilaiAkhir: true },
    });

    const sortedNilai = allSantriNilai
      .map((item) => ({
        santriId: item.santriId,
        avgNilai: item._avg.nilaiAkhir || 0,
      }))
      .sort((a, b) => b.avgNilai - a.avgNilai);

    const ranking =
      sortedNilai.findIndex((item) => item.santriId === santriId) + 1;

    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'global' },
    });
    const kkmDefault = Number(
      (setting?.data as Record<string, unknown>)?.kkmDefault || 70
    );

    const isLulus = nilaiRataRata >= kkmDefault;
    const hasOverride = ujianData.some((u) =>
      Boolean((u.pengaturan as Record<string, any>)?.overrideRemedial)
    );
    const statusKelulusan = isLulus
      ? `Lulus (${calculatePredikat(nilaiRataRata)})`
      : hasOverride
        ? `Tidak Lulus (${calculatePredikat(nilaiRataRata)})`
        : 'Perbaikan / Remedial Required';

    const existingRaport = await prisma.raportSantri.findUnique({
      where: {
        santriId_tahunAjaranId: { santriId, tahunAjaranId },
      },
    });

    let raportSantri;
    if (existingRaport) {
      raportSantri = await prisma.raportSantri.update({
        where: { id: existingRaport.id },
        data: {
          templateRaportId,
          nilaiRataRata,
          ranking,
          statusKelulusan,
          tanggalGenerate: new Date(),
          createdBy: userId,
        },
      });
    } else {
      raportSantri = await prisma.raportSantri.create({
        data: {
          santriId,
          templateRaportId,
          tahunAjaranId,
          nilaiRataRata,
          ranking,
          statusKelulusan,
          createdBy: userId,
        },
      });
    }

    const rekapPerJuz = ujianData.map((u) => ({
      ujianId: u.id,
      label: u.jenisUjianLabel || 'Ujian',
      tanggal: u.tanggalUjian,
      nilaiAkhir: u.nilaiAkhir,
      nilaiPerJuz:
        (u.pengaturan as Record<string, any>)?.nilaiPerJuz || {},
      predikat: calculatePredikat(u.nilaiAkhir),
    }));

    const grafikData = {
      labels: ujianData.map((u) => u.jenisUjianLabel || 'Ujian'),
      values: ujianData.map((u) => u.nilaiAkhir || 0),
      trend:
        nilaiRataRata >= 75 ? 'naik' : nilaiRataRata >= 60 ? 'stabil' : 'turun',
      kkm: kkmDefault,
      rekapPerJuz,
    };

    await prisma.raportSantri.update({
      where: { id: raportSantri.id },
      data: { grafikData: JSON.stringify(grafikData) },
    });

    return {
      santriId,
      templateRaportId,
      tahunAjaranId,
      nilaiRataRata,
      ranking,
      statusKelulusan,
      raportId: raportSantri.id,
    };
  }

  /**
   * Build HTML content for a printable raport document.
   */
  static buildRaportHtml(
    params: ExportRaportParams,
    semester: string,
    tahunAjaran: string
  ): string {
    const {
      santriNama,
      nis,
      halaqah,
      guru,
      totalAyat,
      persentase,
      rataUjian,
      predikat,
      catatanGuru,
    } = params;

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapor Tahfizh - ${santriNama}</title>
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
      Cetak / Simpan PDF Sekarang
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
        <td class="val">${santriNama}</td>
        <td class="label">Semester</td>
        <td class="val">${semester}</td>
      </tr>
      <tr>
        <td class="label">NIS / Username</td>
        <td class="val">${nis}</td>
        <td class="label">Tahun Ajaran</td>
        <td class="val">${tahunAjaran}</td>
      </tr>
      <tr>
        <td class="label">Halaqah</td>
        <td class="val">${halaqah}</td>
        <td class="label">Guru Pembimbing</td>
        <td class="val">${guru}</td>
      </tr>
    </table>

    <div class="section-title">A. Rangkuman Capaian Hafalan</div>
    <div class="stats-grid">
      <div>
        <div class="label">Total Ayat Hafal</div>
        <div class="val">${totalAyat} ayat</div>
      </div>
      <div>
        <div class="label">Target Tercapai</div>
        <div class="val">${persentase}%</div>
      </div>
      <div>
        <div class="label">Rata-Rata Ujian</div>
        <div class="val">${rataUjian}</div>
      </div>
      <div>
        <div class="label">Predikat Akhir</div>
        <div class="val">${predikat}</div>
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
      "${catatanGuru || "Alhamdulillah, ananda menunjukkan kesungguhan yang baik dalam menghafal Al-Quran. Pertahankan konsistensi muroja'ah di rumah agar semakin kuat."}"
    </div>

    <div class="signature-grid">
      <div class="signature-box">
        <div class="title">Mengetahui,<br>Orang Tua / Wali Santri</div>
        <div class="name">( ........................................ )</div>
      </div>
      <div class="signature-box">
        <div class="title">Kota Baru, 28 Juli 2026<br>Wali Halaqah / Guru</div>
        <div class="name">${guru}</div>
      </div>
      <div class="signature-box">
        <div class="title">Mengesahkan,<br>Kepala Tahfizh Lembaga</div>
        <div class="name">Ustadz H. Ahmad Ridwan, Lc., M.A.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}
