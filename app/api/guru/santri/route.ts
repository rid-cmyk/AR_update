import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting guru santri API...')
    
    const { user, error } = await withAuth(request)
    if (error || !user) {
      console.log('❌ Auth failed:', error)
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ User authenticated:', user.namaLengkap, 'Role:', user.role?.name)

    if (user.role?.name?.toLowerCase() !== 'guru') {
      console.log('❌ Access denied - not a guru, role:', user.role?.name)
      return NextResponse.json({ error: 'Access denied - not a guru' }, { status: 403 })
    }

    // Get halaqah yang diajar oleh guru ini
    const halaqahList = await prisma.halaqah.findMany({
      where: { 
        guruId: user.id 
      },
      include: {
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      }
    })

    console.log('📚 Halaqah found:', halaqahList.length)
    halaqahList.forEach(h => {
      console.log(`   - ${h.namaHalaqah}: ${h.santri.length} santri`)
    })

    // Check if guru has any halaqah
    if (!halaqahList || halaqahList.length === 0) {
      console.log('❌ No halaqah assigned to this guru')
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Guru belum memiliki halaqah yang ditugaskan'
      })
    }

    // Extract santri from all halaqah that this guru teaches
    const santriList = halaqahList.flatMap(halaqah => 
      halaqah.santri.map(halaqahSantri => ({
        id: halaqahSantri.santri.id,
        namaLengkap: halaqahSantri.santri.namaLengkap,
        username: halaqahSantri.santri.username,
        halaqah: {
          namaHalaqah: halaqah.namaHalaqah
        }
      }))
    )

    console.log('👥 Total santri found:', santriList.length)
    santriList.forEach(s => {
      console.log(`   - ${s.namaLengkap} (@${s.username}) - ${s.halaqah.namaHalaqah}`)
    })

    return NextResponse.json({ 
      success: true, 
      data: santriList,
      message: `Ditemukan ${santriList.length} santri dari ${halaqahList.length} halaqah`
    })
  } catch (error) {
    console.error('❌ Error fetching santri:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}