import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// GET - Ambil daftar halaqah yang bisa diakses guru (own + permitted)
export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = decoded.id as number;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get own halaqah
    const ownHalaqahs = await prisma.halaqah.findMany({
      where: { guruId: userId },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true
          }
        },
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true
              }
            }
          }
        }
      }
    });

    // Get permitted halaqah
    const permittedHalaqahs = await prisma.guruPermission.findMany({
      where: {
        guruId: userId,
        isActive: true
      },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                id: true,
                namaLengkap: true
              }
            },
            santri: {
              include: {
                santri: {
                  select: {
                    id: true,
                    namaLengkap: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format response
    const accessibleHalaqahs = [
      // Own halaqah
      ...ownHalaqahs.map(h => ({
        id: h.id,
        namaHalaqah: h.namaHalaqah,
        guru: h.guru,
        jumlahSantri: h.santri.length,
        accessType: 'own' as const,
        permissions: {
          canAbsensi: true,
          canHafalan: true,
          canTarget: true
        }
      })),
      // Permitted halaqah
      ...permittedHalaqahs.map(p => ({
        id: p.halaqah.id,
        namaHalaqah: p.halaqah.namaHalaqah,
        guru: p.halaqah.guru,
        jumlahSantri: p.halaqah.santri.length,
        accessType: 'permitted' as const,
        permissions: {
          canAbsensi: p.canAbsensi,
          canHafalan: p.canHafalan,
          canTarget: p.canTarget
        }
      }))
    ];

    // Remove duplicates (jika ada halaqah yang own sekaligus permitted)
    const uniqueHalaqahs = accessibleHalaqahs.reduce((acc, current) => {
      const existing = acc.find(h => h.id === current.id);
      if (!existing) {
        acc.push(current);
      } else if (current.accessType === 'own') {
        // Prioritize own access over permitted
        const index = acc.findIndex(h => h.id === current.id);
        acc[index] = current;
      }
      return acc;
    }, [] as typeof accessibleHalaqahs);

    return NextResponse.json({
      success: true,
      data: uniqueHalaqahs.sort((a, b) => {
        // Sort: own first, then by name
        if (a.accessType === 'own' && b.accessType !== 'own') return -1;
        if (a.accessType !== 'own' && b.accessType === 'own') return 1;
        return a.namaHalaqah.localeCompare(b.namaHalaqah);
      })
    });

  } catch (error) {
    console.error('Error fetching accessible halaqah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

