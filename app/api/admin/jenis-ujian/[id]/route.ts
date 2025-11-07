import { NextRequest, NextResponse } from 'next/server'

// Simulasi data jenis ujian (sama dengan route utama)
let jenisUjianData = [
  {
    id: '1',
    nama: "Tasmi'",
    deskripsi: 'Penilaian hafalan per halaman Al-Quran',
    tipeUjian: 'per-halaman',
    komponenPenilaian: [],
    status: 'aktif',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    nama: 'MHQ',
    deskripsi: 'Musabaqah Hifdzil Quran - Lomba hafalan Al-Quran',
    tipeUjian: 'per-juz',
    komponenPenilaian: [
      { nama: 'Tajwid', bobot: 30 },
      { nama: 'Sifatul Huruf', bobot: 25 },
      { nama: 'Kejelasan Bacaan', bobot: 25 },
      { nama: 'Kelancaran', bobot: 20 }
    ],
    status: 'aktif',
    createdAt: '2024-01-12T09:00:00Z'
  },
  {
    id: '3',
    nama: 'UAS',
    deskripsi: 'Ujian Akhir Semester untuk evaluasi komprehensif',
    tipeUjian: 'per-juz',
    komponenPenilaian: [
      { nama: 'Hafalan', bobot: 50 },
      { nama: 'Pemahaman', bobot: 30 },
      { nama: 'Aplikasi', bobot: 20 }
    ],
    status: 'aktif',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    nama: 'Kenaikan Juz',
    deskripsi: 'Ujian untuk naik ke juz berikutnya',
    tipeUjian: 'per-juz',
    komponenPenilaian: [
      { nama: 'Kelancaran Hafalan', bobot: 60 },
      { nama: 'Tajwid', bobot: 40 }
    ],
    status: 'aktif',
    createdAt: '2024-01-20T11:00:00Z'
  }
]

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cari index jenis ujian yang akan dihapus
    const jenisUjianIndex = jenisUjianData.findIndex(jenisUjian => jenisUjian.id === id)
    
    if (jenisUjianIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Jenis ujian tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    // Hapus jenis ujian dari array
    const deletedJenisUjian = jenisUjianData.splice(jenisUjianIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedJenisUjian,
      message: 'Jenis ujian berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting jenis ujian:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menghapus jenis ujian' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cari jenis ujian berdasarkan ID
    const jenisUjian = jenisUjianData.find(jenisUjian => jenisUjian.id === id)
    
    if (!jenisUjian) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Jenis ujian tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: jenisUjian,
      message: 'Jenis ujian berhasil diambil'
    })
  } catch (error) {
    console.error('Error fetching jenis ujian:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil jenis ujian' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nama, deskripsi, tipeUjian, komponenPenilaian } = body

    // Cari jenis ujian yang akan diupdate
    const jenisUjianIndex = jenisUjianData.findIndex(jenisUjian => jenisUjian.id === id)
    
    if (jenisUjianIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Jenis ujian tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    // Validasi input
    if (!nama || !deskripsi || !tipeUjian) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nama, deskripsi, dan tipe ujian wajib diisi' 
        },
        { status: 400 }
      )
    }

    // Validasi khusus untuk per-juz
    if (tipeUjian === 'per-juz') {
      if (!komponenPenilaian || komponenPenilaian.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Komponen penilaian wajib diisi untuk ujian per-juz' 
          },
          { status: 400 }
        )
      }

      // Validasi total bobot harus 100%
      const totalBobot = komponenPenilaian.reduce((sum: number, komponen: any) => sum + komponen.bobot, 0)
      if (totalBobot !== 100) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Total bobot komponen penilaian harus 100%' 
          },
          { status: 400 }
        )
      }
    }

    // Update jenis ujian
    jenisUjianData[jenisUjianIndex] = {
      ...jenisUjianData[jenisUjianIndex],
      nama,
      deskripsi,
      tipeUjian,
      komponenPenilaian: tipeUjian === 'per-juz' ? komponenPenilaian : [],
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: jenisUjianData[jenisUjianIndex],
      message: 'Jenis ujian berhasil diupdate'
    })
  } catch (error) {
    console.error('Error updating jenis ujian:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengupdate jenis ujian' 
      },
      { status: 500 }
    )
  }
}