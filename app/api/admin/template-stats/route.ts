import { NextResponse } from 'next/server'

// Simulasi data untuk statistik template
export async function GET() {
  try {
    // Dalam implementasi nyata, ambil data dari database
    const stats = {
      totalTahunAkademik: 3, // 2022/2023, 2023/2024, 2024/2025
      totalJenisUjian: 4, // Tasmi', MHQ, UAS, Kenaikan Juz
      totalTemplateUjian: 8, // Template ujian yang sudah dibuat
      totalTemplateRaport: 2, // Template raport yang sudah dibuat
      totalKomponenPenilaian: 12 // Total komponen penilaian dari semua jenis ujian
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching template stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil statistik template' 
      },
      { status: 500 }
    )
  }
}