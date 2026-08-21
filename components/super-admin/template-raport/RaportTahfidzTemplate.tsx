 
'use client'

import React, { useEffect } from 'react'
import './RaportTahfidzTemplate.css'

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
    nilaiPerJuz?: Record<number, { nilai: number; predikat: string; status?: string; isRemedial?: boolean }>
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
              <tr><td>2</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Muraja&apos;ah (Mengulang Hafalan)</td><td>A-</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Konsisten muroja&apos;ah</td></tr>
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
              <tr><td>2</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 5 Juz</td><td>89</td><td>Baik</td></tr>
              <tr><td>3</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 10 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>4</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 15 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>5</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 20 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>6</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 25 Juz</td><td>-</td><td>-</td></tr>
              <tr><td>7</td><td style={{ textAlign: 'left', paddingLeft: '8px' }}>Tasmi&apos; 30 Juz</td><td>-</td><td>-</td></tr>
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
                  {Array.from({ length: 15 }, (_, i) => {
                    const leftJuz = i + 1;
                    const rightJuz = i + 16;
                    const leftData = studentData?.nilaiPerJuz?.[leftJuz];
                    const rightData = studentData?.nilaiPerJuz?.[rightJuz];

                    const leftNilai = leftData ? leftData.nilai : (90 - (i % 5));
                    const leftPred = leftData ? leftData.predikat : 'A';
                    const rightNilai = rightData ? rightData.nilai : (88 + (i % 5));
                    const rightPred = rightData ? rightData.predikat : 'B+';

                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 'bold' }}>Juz {leftJuz}</td>
                        <td style={{ textAlign: 'center' }}>{leftNilai}</td>
                        <td style={{ textAlign: 'center', fontWeight: '500' }}>{leftPred}</td>
                        <td style={{ fontWeight: 'bold' }}>Juz {rightJuz}</td>
                        <td style={{ textAlign: 'center' }}>{rightNilai}</td>
                        <td style={{ textAlign: 'center', fontWeight: '500' }}>{rightPred}</td>
                      </tr>
                    );
                  })}
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

    </div>
  )
}

declare global {
  interface Window {
     
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

