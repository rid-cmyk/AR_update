import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import prisma from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get("auth_token")?.value;

<<<<<<< Updated upstream
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey") as { id: number; role: string };

    // Verify user role is ortu
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        namaLengkap: true,
        role: { select: { name: true } } 
      }
=======
    // Get ortu user
    const ortu = await prisma.user.findUnique({
      where: { id: ortuId },
      include: { role: true }
>>>>>>> Stashed changes
    });

    console.log('🔍 Dashboard Auth Check:', {
      userId: decoded.id,
      userName: user?.namaLengkap,
      userRole: user?.role.name,
      decodedRole: decoded.role
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for both 'ortu' and 'orang_tua' role names
    const isOrtu = user.role.name === 'ortu' || user.role.name === 'orang_tua';
    if (!isOrtu) {
      console.log('❌ Access denied - Role mismatch:', user.role.name);
      return NextResponse.json({ 
        error: "Unauthorized - Only ortu can access",
        userRole: user.role.name 
      }, { status: 403 });
    }

    // Get children (santri) connected to this ortu
    const orangTuaSantriRelations = await prisma.orangTuaSantri.findMany({
      where: {
        orangTuaId: user.id
      },
      include: {
        santri: {
          select: {
            id: true,
            username: true,
            namaLengkap: true,
            foto: true,
            role: {
              select: {
                id: true,
                name: true
              }
            },
            Hafalan: {
              orderBy: { tanggal: 'desc' },
              take: 50 // Last 50 hafalan records
            },
            Absensi: {
              orderBy: { tanggal: 'desc' },
              take: 30 // Last 30 attendance records
            },
            TargetHafalan: {
              orderBy: { deadline: 'desc' }
            },
            Prestasi: {
              orderBy: { tahun: 'desc' }
            }
          }
        }
      }
    });

    // Transform data with additional calculated fields
    const anakList = orangTuaSantriRelations.map(relation => {
      const santri = relation.santri;
      const totalHafalan = santri.Hafalan.length;
      const totalAbsensi = santri.Absensi.length;
      const totalAbsensiMasuk = santri.Absensi.filter(a => a.status === 'masuk').length;
      
      return {
        ...santri,
        hafalanProgress: totalHafalan > 0 ? Math.min(Math.round((totalHafalan / 30) * 100), 100) : 0,
        attendanceRate: totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0,
        totalPrestasi: santri.Prestasi.length,
        lastActivity: santri.Hafalan[0]?.tanggal || santri.Absensi[0]?.tanggal || new Date().toISOString()
      };
    });

    // Calculate overview statistics
    const totalChildren = anakList.length;
    
    let totalHafalan = 0;
    let totalAbsensiMasuk = 0;
    let totalAbsensi = 0;
    let totalPrestasi = 0;

    anakList.forEach(anak => {
      totalHafalan += anak.Hafalan.length;
      totalAbsensiMasuk += anak.Absensi.filter(a => a.status === 'masuk').length;
      totalAbsensi += anak.Absensi.length;
      totalPrestasi += anak.Prestasi.length;
    });

    const avgHafalanProgress = totalChildren > 0 ? Math.round((totalHafalan / totalChildren) * 10) / 10 : 0;
    const avgAttendanceRate = totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0;

    return NextResponse.json({
      success: true,
      anakList,
      overview: {
        totalChildren,
        avgHafalanProgress,
        avgAttendanceRate,
        totalPrestasi
      },
      orangTuaInfo: {
        id: user.id,
        namaLengkap: user.namaLengkap
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('GET /api/ortu/dashboard error:', error);
    
    // Return empty data instead of error to prevent UI crash
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch ortu dashboard data',
      anakList: [],
      overview: {
        totalChildren: 0,
        avgHafalanProgress: 0,
        avgAttendanceRate: 0,
        totalPrestasi: 0
      }
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
