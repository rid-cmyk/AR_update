import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }
    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } })
    const data = (setting?.data as any) || {}
    const kriteria = data.mhq_kriteria || [{ id: '1', nama: 'Tajwid', bobot: 30, deskripsi: 'Ketepatan dalam penerapan kaidah tajwid' }, { id: '2', nama: 'Sifatul Huruf', bobot: 25, deskripsi: 'Kejelasan sifat-sifat huruf hijaiyah' }, { id: '3', nama: 'Kejelasan Bacaan', bobot: 25, deskripsi: 'Kejelasan dan ketepatan dalam membaca' }, { id: '4', nama: 'Kelancaran', bobot: 20, deskripsi: 'Kelancaran dan kecepatan dalam membaca' }]
    return NextResponse.json(kriteria)
  } catch (error) {
    console.error('Error fetching MHQ kriteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { kriteria } = body

    // Validasi
    if (!kriteria || !Array.isArray(kriteria)) {
      return NextResponse.json({ error: 'Data kriteria tidak valid' }, { status: 400 })
    }

    const totalBobot = kriteria.reduce((sum: number, k: Record<string, unknown>) => sum + (k.bobot as number), 0)
    if (totalBobot !== 100) {
      return NextResponse.json({ error: 'Total bobot harus 100%' }, { status: 400 })
    }

    // Update kriteria
    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } })
    const existingData = (setting?.data as any) || {}
    await prisma.systemSetting.upsert({
      where: { id: 'global' },
      update: { data: { ...existingData, mhq_kriteria: kriteria } },
      create: { id: 'global', data: { mhq_kriteria: kriteria } }
    })
    return NextResponse.json({ message: 'Kriteria MHQ berhasil disimpan', kriteria: kriteria })
  } catch (error) {
    console.error('Error saving MHQ kriteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}