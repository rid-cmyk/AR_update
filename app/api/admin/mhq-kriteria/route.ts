import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simulasi penyimpanan kriteria MHQ (dalam implementasi nyata bisa disimpan di database)
let mhqKriteria = [
  { id: '1', nama: 'Tajwid', bobot: 30, deskripsi: 'Ketepatan dalam penerapan kaidah tajwid' },
  { id: '2', nama: 'Sifatul Huruf', bobot: 25, deskripsi: 'Kejelasan sifat-sifat huruf hijaiyah' },
  { id: '3', nama: 'Kejelasan Bacaan', bobot: 25, deskripsi: 'Kejelasan dan ketepatan dalam membaca' },
  { id: '4', nama: 'Kelancaran', bobot: 20, deskripsi: 'Kelancaran dan kecepatan dalam membaca' }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(mhqKriteria)
  } catch (error) {
    console.error('Error fetching MHQ kriteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { kriteria } = body

    // Validasi
    if (!kriteria || !Array.isArray(kriteria)) {
      return NextResponse.json({ error: 'Data kriteria tidak valid' }, { status: 400 })
    }

    const totalBobot = kriteria.reduce((sum: number, k: any) => sum + k.bobot, 0)
    if (totalBobot !== 100) {
      return NextResponse.json({ error: 'Total bobot harus 100%' }, { status: 400 })
    }

    // Update kriteria
    mhqKriteria = kriteria

    return NextResponse.json({ message: 'Kriteria MHQ berhasil disimpan', kriteria: mhqKriteria })
  } catch (error) {
    console.error('Error saving MHQ kriteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}