import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUser } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get active templates for current academic year
    const templates = await prisma.templateUjian.findMany({
      where: {
        status: 'aktif'
      },
      include: {
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
        },
        tahunAjaran: {
          select: { 
            namaLengkap: true,
            isActive: true 
          }
        }
      },
      orderBy: { namaTemplate: 'asc' }
    })

    // Filter only templates from active academic year
    const activeTemplates = templates.filter(template => 
      template.tahunAjaran.isActive
    )

    return NextResponse.json(activeTemplates)
  } catch (error) {
    console.error('Error fetching template ujian for guru:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}