import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil data hafalan untuk guru
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

    let whereClause: any = {
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
    if (status && ['ziyadah', 'murojaah'].includes(status)) {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [hafalan, total] = await Promise.all([
      prisma.hafalan.findMany({
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
          tanggal: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.hafalan.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: hafalan,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Input hafalan baru
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
    const { santriId, tanggal, surat, ayatMulai, ayatSelesai, status, keterangan } = body;

    // Validation
    if (!santriId || !tanggal || !surat || !ayatMulai || !ayatSelesai || !status) {
      return NextResponse.json({ 
        error: 'Data tidak lengkap. Santri, tanggal, surat, ayat, dan status harus diisi.' 
      }, { status: 400 });
    }

    // Validate status
    if (!['ziyadah', 'murojaah'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status harus ziyadah atau murojaah' 
      }, { status: 400 });
    }

    // Validate ayat range
    if (ayatMulai > ayatSelesai) {
      return NextResponse.json({ 
        error: 'Ayat mulai tidak boleh lebih besar dari ayat selesai' 
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

    // Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: parseInt(santriId),
        tanggal: new Date(tanggal),
        surat,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        status: status as any,
        keterangan: keterangan || null
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
        pesan: `Hafalan baru telah diinput: ${surat} ayat ${ayatMulai}-${ayatSelesai} (${status})`,
        type: 'hafalan',
        refId: hafalan.id,
        userId: parseInt(santriId)
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_HAFALAN',
        keterangan: `Guru ${user.namaLengkap} menginput hafalan ${surat} untuk ${hafalan.santri.namaLengkap}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil diinput',
      data: hafalan
    });

  } catch (error) {
    console.error('Error creating hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}