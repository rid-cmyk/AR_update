'use client'

import React, { useEffect } from 'react'

export interface TemplateRaportData {
  id?: number
  namaTemplate?: string
  namaLembaga?: string
  logoLembaga?: string | null
  alamatLembaga?: string | null
  headerKop?: string | null
  headerKopSurat?: string | null
  footerKop?: string | null
  footerRaport?: string | null
  tandaTanganKepala?: string | null
  namaKepala?: string | null
  jabatanKepala?: string | null
  tampilanGrafik?: boolean
  tampilanRanking?: boolean
  catatanTemplate?: string | null
  status?: string
  tahunAjaranId?: number
  tahunAkademik?: string
  tahunAjaran?: {
    namaLengkap?: string
    tahunMulai?: number
    tahunSelesai?: number
    semester?: string
  } | null
}

interface RaportTahfidzProps {
  template?: TemplateRaportData | null
  studentData?: {
    namaSantri?: string
    semester?: string
    kelas?: string
    tahunAjaran?: string
    pembimbing?: string
    halaqoh?: string
    gradeAkhir?: string
    targetHafalan?: string
    hafalanTerakhir?: string
    catatan?: string
  }
  onClose?: () => void
}

export function RaportTahfidzTemplate({ template, studentData, onClose }: RaportTahfidzProps) {
  useEffect(() => {
    // Dynamically load html2pdf script if not already present
    if (typeof window !== 'undefined' && !window.html2pdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleDownloadPDF = () => {
    const element = document.getElementById('raport-content')
    if (!element) return

    if (window.html2pdf) {
      const opt = {
        margin: 0,
        filename: `rapor-tahfidz-${template?.namaTemplate ? template.namaTemplate.toLowerCase().replace(/\s+/g, '-') : 'arrahman'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      window.html2pdf().set(opt).from(element).save()
    } else {
      window.print()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const namaLembaga = template?.namaLembaga || "PESANTREN TAHFIDZ QUR'AN & DIGITAL AR-RAHMAN"
  const alamatLembaga = template?.alamatLembaga || template?.headerKop || template?.headerKopSurat || "Ruko Hexa Green Blok C8 - C9 Jl. Raya Kalimalang, Kel. Jatimulya, Kec. Tambun Selatan Kab. Bekasi - Jawa Barat 17510 Telp.081283612352"
  const judulRaport = template?.namaTemplate || "RAPOR TAHFIDZ AL - QUR'AN"
  const tahunAjaranText = studentData?.tahunAjaran || template?.tahunAjaran?.namaLengkap || template?.tahunAkademik || "2024 / 2025"
  const semesterText = studentData?.semester || template?.tahunAjaran?.semester || "1 (Satu)"
  const namaKepalaText = template?.namaKepala || "Ziyad Khairy Al - Hafidz"
  const jabatanKepalaText = template?.jabatanKepala || "Mudir Ma'had"
  const catatanText = studentData?.catatan || template?.catatanTemplate || "Santri menunjukkan perkembangan hafalan yang stabil dan disiplin dalam mengikuti halaqah. Diharapkan dapat meningkatkan kualitas tajwid serta muroja'ah rutin."
  const footerText = template?.footerRaport || template?.footerKop || "AR-RAHMAN - PESANTREN TAHFIDZ QUR'AN DAN DIGITAL"

  return (
    <div className="raport-wrapper-root">
      <div className="btn-group-action no-print">
        {onClose && (
          <button className="btn-back" onClick={onClose}>
            ⬅️ Kembali
          </button>
        )}
        <button className="btn-download" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
        <button className="btn-print" onClick={handlePrint}>
          🖨️ Cetak Raport
        </button>
      </div>

      <div className="raport-container" id="raport-content">
        {/* Header with Logo */}
        <div className="header-layout">
          <div className="header-logo">
            {template?.logoLembaga ? (
              <img
                src={template.logoLembaga}
                alt="Logo Lembaga"
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            ) : (
              <PesantrenLogoBadge />
            )}
          </div>
          <div className="header-text">
            <div className="arabic-title">معهد التربية الإسلامية الرحمن لتحفيظ القرآن والتكنولوجيا</div>
            <div className="indonesian-title">{namaLembaga}</div>
            <div className="address">{alamatLembaga}</div>
          </div>
          <div className="header-logo-spacer" style={{ width: '64px', flexShrink: 0 }}>
            {/* Mirror spacer for symmetrical text alignment */}
            {template?.logoLembaga ? (
              <img
                src={template.logoLembaga}
                alt=""
                style={{ width: '64px', height: '64px', objectFit: 'contain', opacity: 0 }}
              />
            ) : (
              <div style={{ width: '64px', height: '64px' }} />
            )}
          </div>
        </div>

        {/* Report Title */}
        <div className="report-title">{judulRaport}</div>

        {/* Student Info */}
        <div className="student-info">
          <div className="info-row">
            <div className="info-label">Nama Santri</div>
            <div className="info-value">: {studentData?.namaSantri || 'Ahmad Zaki'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Semester</div>
            <div className="info-value">: {semesterText}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Kelas</div>
            <div className="info-value">: {studentData?.kelas || 'Halaqah A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Tahun Ajaran</div>
            <div className="info-value">: {tahunAjaranText}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Pembimbing</div>
            <div className="info-value">: {studentData?.pembimbing || 'Ust. Abdullah'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Halaqoh</div>
            <div className="info-value">: {studentData?.halaqoh || 'Halaqah Pagi'}</div>
          </div>
        </div>

        {/* Aspek Penilaian */}
        <div className="content-section">
          <div className="section-title">Aspek Penilaian</div>
          <table>
            <thead>
              <tr>
                <th style={{ width: '8%' }}>No</th>
                <th style={{ width: '50%' }}>Aspek</th>
                <th style={{ width: '15%' }}>Nilai</th>
                <th style={{ width: '27%' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Adab di Dalam Halaqah</td><td>A</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Baik dan santun</td></tr>
              <tr><td>2</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Muraja'ah (Mengulang Hafalan)</td><td>A-</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Konsisten muroja'ah</td></tr>
              <tr><td>3</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tajwid & Makharijul Huruf</td><td>B+</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Perlu peningkatan tajwid</td></tr>
            </tbody>
          </table>
        </div>

        {/* Ujian */}
        <div className="content-section">
          <div className="section-title">Ujian</div>
          <table>
            <thead>
              <tr>
                <th style={{ width: '8%' }}>No</th>
                <th style={{ width: '50%' }}>Ujian</th>
                <th style={{ width: '15%' }}>Nilai</th>
                <th style={{ width: '27%' }}>Predikat</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Ujian Akhir Semester</td><td>92</td><td>Sangat Baik</td></tr>
              <tr><td>2</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 5 Juz</td><td>89</td><td>Baik</td></tr>
              <tr><td>3</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 10 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>4</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 15 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>5</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 20 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>6</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 25 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>7</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi' 30 Juz</td><td>-</td><td>-</td></tr>
            </tbody>
          </table>
        </div>

        {/* Nilai Per Juz + Info Cards */}
        <div className="content-section">
          <div className="section-title">Nilai Per Juz</div>
          <div style={{ display: 'flex', gap: '12px', margin: '8px 0' }}>
            {/* Tabel Nilai Per Juz */}
            <div style={{ flex: 3 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Juz</th>
                    <th style={{ width: '18%' }}>Nilai</th>
                    <th style={{ width: '20%' }}>Predikat</th>
                    <th style={{ width: '12%' }}>Juz</th>
                    <th style={{ width: '18%' }}>Nilai</th>
                    <th style={{ width: '20%' }}>Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>90</td><td>A</td><td>16</td><td>88</td><td>B+</td></tr>
                  <tr><td>2</td><td>88</td><td>B+</td><td>17</td><td>85</td><td>B</td></tr>
                  <tr><td>3</td><td>87</td><td>B+</td><td>18</td><td>87</td><td>B+</td></tr>
                  <tr><td>4</td><td>89</td><td>B+</td><td>19</td><td>89</td><td>B+</td></tr>
                  <tr><td>5</td><td>90</td><td>A</td><td>20</td><td>92</td><td>A</td></tr>
                  <tr><td>6</td><td>85</td><td>B</td><td>21</td><td>91</td><td>A</td></tr>
                  <tr><td>7</td><td>86</td><td>B</td><td>22</td><td>90</td><td>A</td></tr>
                  <tr><td>8</td><td>88</td><td>B+</td><td>23</td><td>88</td><td>B+</td></tr>
                  <tr><td>9</td><td>90</td><td>A</td><td>24</td><td>89</td><td>B+</td></tr>
                  <tr><td>10</td><td>92</td><td>A</td><td>25</td><td>87</td><td>B+</td></tr>
                  <tr><td>11</td><td>90</td><td>A</td><td>26</td><td>90</td><td>A</td></tr>
                  <tr><td>12</td><td>91</td><td>A</td><td>27</td><td>92</td><td>A</td></tr>
                  <tr><td>13</td><td>93</td><td>A</td><td>28</td><td>91</td><td>A</td></tr>
                  <tr><td>14</td><td>92</td><td>A</td><td>29</td><td>93</td><td>A</td></tr>
                  <tr><td>15</td><td>95</td><td>A+</td><td>30</td><td>94</td><td>A</td></tr>
                </tbody>
              </table>
            </div>

            {/* Kolom Info: Grade Akhir, Target Hafalan, Hafalan Terakhir */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="info-card">
                <div className="info-card-title">Grade Akhir</div>
                <div className="grade-card-value">{studentData?.gradeAkhir || 'A'}</div>
              </div>
              <div className="info-card">
                <div className="info-card-title">Target Hafalan</div>
                <div className="info-card-value">{studentData?.targetHafalan || 'Juz 10'}</div>
              </div>
              <div className="info-card">
                <div className="info-card-title">Hafalan Terakhir</div>
                <div className="info-card-value">{studentData?.hafalanTerakhir || 'Juz 5'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Pembimbing */}
        <div className="notes-section">
          <div className="notes-title">Catatan Pembimbing</div>
          <div className="notes-content">{catatanText}</div>
        </div>

        {/* Tanda Tangan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px' }}>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-name">Orang Tua / Wali</div>
            <div className="signature-role">(Nama Ortu)</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-name">Pembimbing</div>
            <div className="signature-role">(Nama Guru)</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-name">{jabatanKepalaText}</div>
            <div className="signature-role">({namaKepalaText})</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">{footerText}</div>
      </div>

      <style jsx global>{`
        :root {
          --light-bg: #f0f9f4;
          --dark: #1e293b;
          --gray: #64748b;
          --border: #cbd5e1;
          --accent-green: #2e7d32;
          --light-green: #e8f5e9;
        }

        .raport-wrapper-root {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
          font-size: 11.5px;
          line-height: 1.3;
          width: 100%;
        }

        .btn-group-action {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn-download {
          background: #2e7d32;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s;
        }

        .btn-download:hover {
          background: #1b5e20;
        }

        .btn-back {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .btn-back:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .btn-print {
          background: #64748b;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s;
        }

        .btn-print:hover {
          background: #475569;
        }

        .raport-container {
          width: 21cm;
          min-height: 29.7cm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          position: relative;
          padding: 12mm 15mm;
          box-sizing: border-box;
          text-align: left;
        }

        .header-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #2e7d32;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .header-logo {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-text {
          flex: 1;
          text-align: center;
          padding: 0 8px;
        }

        .arabic-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 4px;
          font-family: 'Traditional Arabic', serif;
          color: #2e7d32;
        }

        .indonesian-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 3px;
          color: #1e293b;
        }

        .address {
          font-size: 9.5px;
          color: #64748b;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .report-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 12px 0 10px;
          text-decoration: underline;
          color: #2e7d32;
        }

        .student-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
          margin-bottom: 12px;
          font-size: 11px;
        }

        .info-row {
          display: flex;
        }

        .info-label {
          font-weight: bold;
          min-width: 105px;
        }

        .info-value {
          flex: 1;
        }

        .raport-container table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          font-size: 10.5px;
        }

        .raport-container th {
          background: #2e7d32;
          color: white;
          padding: 4px;
          text-align: center;
          border: 1px solid #cbd5e1;
          font-weight: 600;
        }

        .raport-container td {
          padding: 3px;
          border: 1px solid #cbd5e1;
          text-align: center;
        }

        .info-card {
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          padding: 8px 6px;
          background-color: #e8f5e9;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .info-card-title {
          font-weight: bold;
          font-size: 10.5px;
          color: #2e7d32;
          margin-bottom: 5px;
        }

        .info-card-value {
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
        }

        .grade-card-value {
          font-size: 22px;
          font-weight: bold;
          color: #2e7d32;
        }

        .notes-section {
          margin: 10px 0;
          border: 1px solid #cbd5e1;
          padding: 10px;
          border-radius: 5px;
          background-color: #fafafa;
          border-left: 4px solid #2e7d32;
        }

        .notes-title {
          font-weight: bold;
          font-size: 11.5px;
          color: #2e7d32;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #cbd5e1;
        }

        .notes-content {
          font-size: 11px;
          line-height: 1.4;
        }

        .signature-box {
          text-align: center;
          margin-top: 12px;
        }

        .signature-line {
          width: 140px;
          height: 1px;
          background: #1e293b;
          margin: 22px auto 4px;
        }

        .signature-name {
          font-weight: bold;
          font-size: 11px;
        }

        .signature-role {
          font-size: 9.5px;
          color: #64748b;
        }

        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 9.5px;
          color: #64748b;
          border-top: 1px solid #cbd5e1;
          padding-top: 8px;
        }

        .content-section {
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #2e7d32;
          margin-bottom: 6px;
          padding-left: 5px;
          border-left: 3px solid #2e7d32;
          text-align: left;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .raport-container {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            padding: 10mm 12mm !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf?: any
  }
}

function PesantrenLogoBadge() {
  return (
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="4" />
      <circle cx="50" cy="50" r="40" stroke="#1b5e20" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Crescent & Star */}
      <path d="M48 24C41 24 35 30 35 37C35 44 41 50 48 50C44 50 40 46 40 41C40 36 43 32 48 30C46 28 47 25 48 24Z" fill="#2e7d32" />
      <polygon points="58,26 60,31 65,31 61,34 62,39 58,36 54,39 55,34 51,31 56,31" fill="#d97706" />
      {/* Open Quran Book */}
      <path d="M30 62C38 58 46 62 50 64C54 62 62 58 70 62V78C62 74 54 78 50 76C46 78 38 74 30 78V62Z" fill="#1b5e20" />
      <path d="M32 64C39 60 46 64 49 65.5V75.5C46 74 39 70 32 74V64Z" fill="#ffffff" />
      <path d="M68 64C61 60 54 64 51 65.5V75.5C54 74 61 70 68 74V64Z" fill="#ffffff" />
      {/* Book stand / Rehal */}
      <path d="M40 76L60 86M60 76L40 86" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

