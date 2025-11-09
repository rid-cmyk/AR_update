import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const userRole = user.role.name.toLowerCase();

    // Get latest announcements based on user role
    const targetAudiences = ['semua'];
    
    if (userRole === 'guru') {
      targetAudiences.push('guru');
    } else if (userRole === 'santri') {
      targetAudiences.push('santri');
    } else if (userRole === 'ortu' || userRole === 'orang_tua') {
      targetAudiences.push('ortu');
    } else if (userRole === 'admin') {
      targetAudiences.push('admin');
    } else if (userRole === 'yayasan') {
      targetAudiences.push('yayasan');
    }

    // Get latest 5 announcements that user hasn't read
    const latestAnnouncements = await prisma.pengumuman.findMany({
      where: {
        targetAudience: {
          in: targetAudiences as any[]
        },
        OR: [
          { tanggalKadaluarsa: null },
          { tanggalKadaluarsa: { gte: new Date() } }
        ],
        NOT: {
          dibacaOleh: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        creator: {
          select: {
            namaLengkap: true,
            role: {
              select: {
                name: true
              }
            }
          }
        },
        dibacaOleh: {
          where: {
            userId: userId
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      announcements: latestAnnouncements.map(announcement => ({
        id: announcement.id,
        judul: announcement.judul,
        isi: announcement.isi,
        tanggal: announcement.tanggal,
        createdAt: announcement.createdAt,
        createdBy: announcement.creator?.namaLengkap || 'Unknown',
        creatorRole: announcement.creator?.role?.name || 'Unknown',
        isRead: announcement.dibacaOleh.length > 0
      }))
    });

  } catch (error) {
    console.error("Error fetching latest announcements:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengumuman terbaru" },
      { status: 500 }
    );
  }
}

