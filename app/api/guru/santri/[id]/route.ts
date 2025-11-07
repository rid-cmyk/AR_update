import { NextRequest, NextResponse } from 'next/server'

// Simulasi data santri berdasarkan halaqah (sama dengan route utama)
const santriByHalaqah = {
  'halaqah-umar': [
    {
      id: '1',
      nama: 'Ahmad Fauzi bin Abdullah',
      kelas: 'Halaqah Umar',
      halaqah: 'Halaqah Umar',
      juzTerakhir: 5,
      halamanTerakhir: 95,
      status: 'aktif',
      avatar: '👨‍🎓'
    },
    {
      id: '2',
      nama: 'Muhammad Ridho',
      kelas: 'Halaqah Umar',
      halaqah: 'Halaqah Umar',
      juzTerakhir: 3,
      halamanTerakhir: 60,
      status: 'aktif',
      avatar: '👨‍🎓'
    },
    {
      id: '3',
      nama: 'Abdullah Al-Farisi',
      kelas: 'Halaqah Umar',
      halaqah: 'Halaqah Umar',
      juzTerakhir: 7,
      halamanTerakhir: 140,
      status: 'aktif',
      avatar: '👨‍🎓'
    },
    {
      id: '4',
      nama: 'Yusuf Al-Makki',
      kelas: 'Halaqah Umar',
      halaqah: 'Halaqah Umar',
      juzTerakhir: 4,
      halamanTerakhir: 80,
      status: 'aktif',
      avatar: '👨‍🎓'
    }
  ]
}

const getCurrentGuruHalaqah = () => 'halaqah-umar'
const santriData = santriByHalaqah[getCurrentGuruHalaqah()] || []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Cari santri berdasarkan ID
    const santri = santriData.find(s => s.id === id)
    
    if (!santri) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Santri tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: santri,
      message: 'Data santri berhasil diambil'
    })
  } catch (error) {
    console.error('Error fetching santri:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil data santri' 
      },
      { status: 500 }
    )
  }
}