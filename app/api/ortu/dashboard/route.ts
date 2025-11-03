import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch ortu dashboard data
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would get the current user ID from session/JWT
    // For now, we'll use a mock ortu ID
    const ortuId = 1; // This should come from authentication

    // Get ortu user
    const ortu = await prisma.user.findUnique({
      where: { id: ortuId },
      include: {
        role: true
      }
    });

    if (!ortu || ortu.role.name.toLowerCase() !== 'ortu') {
      return NextResponse.json(
        { error: 'User bukan orang tua' },
        { status: 400 }
      );
    }

    // Get children
    const childrenRelations = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: ortuId },
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
            }
          }
        }
      }
    });

    const children = childrenRelations.map(relation => relation.santri);

    // Get additional data for each child
    const childrenWithData = await Promise.all(
      children.map(async (child) => {
        // Get hafalan progress
        const hafalanCount = await prisma.hafalan.count({
          where: { 
            santriId: child.id,
            status: 'ziyadah' // New memorization
          }
        });

        // Get attendance rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalAbsensi = await prisma.absensi.count({
          where: {
            santriId: child.id,
            tanggal: {
              gte: thirtyDaysAgo
            }
          }
        });

        const hadirCount = await prisma.absensi.count({
          where: {
            santriId: child.id,
            status: 'masuk',
            tanggal: {
              gte: thirtyDaysAgo
            }
          }
        });

        const attendanceRate = totalAbsensi > 0 ? Math.round((hadirCount / totalAbsensi) * 100) : 0;

        // Get prestasi count
        const prestasiCount = await prisma.prestasi.count({
          where: { santriId: child.id }
        });

        // Get last activity
        const lastActivity = await prisma.absensi.findFirst({
          where: { santriId: child.id },
          orderBy: { tanggal: 'desc' },
          select: { tanggal: true }
        });

        return {
          ...child,
          hafalanProgress: Math.min(hafalanCount * 5, 100), // Rough calculation
          attendanceRate,
          totalPrestasi: prestasiCount,
          lastActivity: lastActivity?.tanggal.toISOString().split('T')[0] || null
        };
      })
    );

    // Calculate overview statistics
    const totalChildren = children.length;
    const avgHafalanProgress = totalChildren > 0 
      ? Math.round(childrenWithData.reduce((sum, child) => sum + (child.hafalanProgress || 0), 0) / totalChildren)
      : 0;
    const avgAttendanceRate = totalChildren > 0
      ? Math.round(childrenWithData.reduce((sum, child) => sum + (child.attendanceRate || 0), 0) / totalChildren)
      : 0;
    const totalPrestasi = childrenWithData.reduce((sum, child) => sum + (child.totalPrestasi || 0), 0);

    const dashboardData = {
      children: childrenWithData,
      overview: {
        totalChildren,
        avgHafalanProgress,
        avgAttendanceRate,
        totalPrestasi
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching ortu dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}