import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil data target hafalan untuk guru
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const santriName = searchParams.get('santriName');
    const surat = searchParams.get('surat');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get santri in guru's halaqah first
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        halaqah: {
          guruId: userId
        }
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    });

    let santriIds = halaqahSantri.map(hs => hs.santriId);

    // Filter by specific santri if specified
    if (santriId) {
      santriIds = santriIds.filter(id => id === parseInt(santriId));
    }

    // Filter by santri name if specified
    if (santriName) {
      const filteredSantri = halaqahSantri.filter(hs => 
        hs.santri.namaLengkap.toLowerCase().includes(santriName.toLowerCase())
      );
      santriIds = filteredSantri.map(hs => hs.santriId);
    }

    const whereClause: any = {
      santriId: { in: santriIds }
    };

    // Filter by surat if specified
    if (surat) {
      whereClause.surat = {
        contains: surat,
        mode: 'insensitive'
      };
    }

    // Filter by status if specified
    if (status && ['belum', 'proses', 'selesai'].includes(status)) {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [targets, total] = await Promise.all([
      prisma.targetHafalan.findMany({
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
        },
        skip,
        take: limit
      }),
      prisma.targetHafalan.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: targets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat target hafalan baru
export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status } = body;

    // Validation
    if (!santriId || !surat || !ayatTarget || !deadline) {
      return NextResponse.json({ 
        error: 'Data tidak lengkap. Santri, surat, target ayat, dan deadline harus diisi.' 
      }, { status: 400 });
    }

    // Validate status
    const validStatus = status || 'belum';
    if (!['belum', 'proses', 'selesai'].includes(validStatus)) {
      return NextResponse.json({ 
        error: 'Status harus belum, proses, atau selesai' 
      }, { status: 400 });
    }

    // Validate ayat target
    if (ayatTarget <= 0) {
      return NextResponse.json({ 
        error: 'Target ayat harus lebih dari 0' 
      }, { status: 400 });
    }

    // Check if santri is in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId: parseInt(santriId),
        halaqah: {
          guruId: userId
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({ 
        error: 'Santri tidak ada dalam halaqah Anda' 
      }, { status: 403 });
    }

    // Check if target already exists for this santri and surat
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        santriId: parseInt(santriId),
        surat: surat,
        status: { in: ['belum', 'proses'] }
      }
    });

    if (existingTarget) {
      return NextResponse.json({ 
        error: `Target untuk surat ${surat} sudah ada dan belum selesai` 
      }, { status: 400 });
    }

    // Create target hafalan
    const target = await prisma.targetHafalan.create({
      data: {
        santriId: parseInt(santriId),
        surat,
        ayatTarget: parseInt(ayatTarget),
        deadline: new Date(deadline),
        status: validStatus as any
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // Create notification for santri
    await prisma.notifikasi.create({
      data: {
        pesan: `Target hafalan baru: ${surat} (${ayatTarget} ayat) - deadline ${new Date(deadline).toLocaleDateString('id-ID')}`,
        type: 'hafalan',
        refId: target.id,
        userId: parseInt(santriId)
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TARGET',
        keterangan: `Guru ${user.namaLengkap} menetapkan target ${surat} untuk ${target.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil dibuat',
      data: target
    });

  } catch (error) {
    console.error('Error creating target hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}