import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Ambil data target hafalan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')

    // TODO: Get guru ID from session/auth
    const guru = await prisma.user.findFirst({
      where: {
        role: {
          name: 'guru'
        }
      }
    })

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'Guru tidak ditemukan'
      }, { status: 404 })
    }

    // Get target hafalan data
    const whereClause: any = {}
    if (santriId) {
      whereClause.santriId = parseInt(santriId)
    } else {
      // Get all santri from guru's halaqah
      const halaqahList = await prisma.halaqah.findMany({
        where: { guruId: guru.id },
        include: {
          santri: {
            select: { santriId: true }
          }
        }
      })
      
      const santriIds = halaqahList.flatMap(h => h.santri.map(s => s.santriId))
      whereClause.santriId = { in: santriIds }
    }

    const targetData = await prisma.targetHafalan.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    })

    // Calculate current progress for each target
    const targetsWithProgress = await Promise.all(
      targetData.map(async (target) => {
        // Get hafalan data for this specific target
        const hafalanData = await prisma.hafalan.findMany({
          where: {
            santriId: target.santriId,
            surat: target.surat,
            status: 'ziyadah', // Only count ziyadah for progress
            tanggal: {
              lte: target.deadline
            }
          },
          orderBy: {
            ayatSelesai: 'desc'
          }
        })

        // Calculate current progress based on highest ayat reached
        let currentAyat = 0
        if (hafalanData.length > 0) {
          const latestHafalan = hafalanData[0]
          currentAyat = Math.min(latestHafalan.ayatSelesai, target.ayatTarget)
        }

        return {
          id: target.id,
          santriId: target.santriId,
          santriNama: target.santri.namaLengkap,
          surat: target.surat,
          ayatTarget: target.ayatTarget,
          currentAyat: currentAyat,
          deadline: target.deadline.toISOString(),
          status: target.status,
          progressPercentage: Math.round((currentAyat / target.ayatTarget) * 100)
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: targetsWithProgress,
      message: 'Data target hafalan berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching target hafalan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data target hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Buat target hafalan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { santriId, surat, ayatTarget, deadline } = body

    // Validasi input
    if (!santriId || !surat || !ayatTarget || !deadline) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak lengkap'
      }, { status: 400 })
    }

    // TODO: Get guru ID from session/auth
    const guru = await prisma.user.findFirst({
      where: {
        role: {
          name: 'guru'
        }
      }
    })

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'Guru tidak ditemukan'
      }, { status: 404 })
    }

    // Validasi santri ada dalam halaqah guru
    const santriInHalaqah = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: parseInt(santriId),
        halaqah: {
          guruId: guru.id
        }
      }
    })

    if (!santriInHalaqah) {
      return NextResponse.json({
        success: false,
        message: 'Santri tidak ada dalam halaqah Anda'
      }, { status: 403 })
    }

    // Check if target already exists for this santri and surah
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        santriId: parseInt(santriId),
        surat: surat,
        status: { in: ['belum', 'proses'] }
      }
    })

    if (existingTarget) {
      return NextResponse.json({
        success: false,
        message: 'Target untuk surah ini sudah ada dan belum selesai'
      }, { status: 400 })
    }

    // Create target hafalan
    const newTarget = await prisma.targetHafalan.create({
      data: {
        santriId: parseInt(santriId),
        surat: surat,
        ayatTarget: parseInt(ayatTarget),
        deadline: new Date(deadline),
        status: 'belum'
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newTarget.id,
        santriId: newTarget.santriId,
        santriNama: newTarget.santri.namaLengkap,
        surat: newTarget.surat,
        ayatTarget: newTarget.ayatTarget,
        deadline: newTarget.deadline.toISOString(),
        status: newTarget.status
      },
      message: 'Target hafalan berhasil dibuat'
    })

  } catch (error) {
    console.error('Error creating target hafalan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal membuat target hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update target hafalan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, surat, ayatTarget, deadline, status } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID target tidak ditemukan'
      }, { status: 400 })
    }

    // TODO: Validate guru has permission to edit this target

    const updatedTarget = await prisma.targetHafalan.update({
      where: { id: parseInt(id) },
      data: {
        surat: surat,
        ayatTarget: parseInt(ayatTarget),
        deadline: new Date(deadline),
        status: status
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTarget.id,
        santriId: updatedTarget.santriId,
        santriNama: updatedTarget.santri.namaLengkap,
        surat: updatedTarget.surat,
        ayatTarget: updatedTarget.ayatTarget,
        deadline: updatedTarget.deadline.toISOString(),
        status: updatedTarget.status
      },
      message: 'Target hafalan berhasil diupdate'
    })

  } catch (error) {
    console.error('Error updating target hafalan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengupdate target hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Hapus target hafalan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID target tidak ditemukan'
      }, { status: 400 })
    }

    // TODO: Validate guru has permission to delete this target

    await prisma.targetHafalan.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting target hafalan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus target hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}