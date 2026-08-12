import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/database/prisma'



export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }
    if (!['guru', 'super_admin', 'admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
