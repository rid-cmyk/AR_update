import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Verify user is yayasan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'yayasan') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get global statistics
    const totalSantri = await prisma.user.count({
      where: { role: { name: 'santri' } }
    });

    const totalGuru = await prisma.user.count({
      where: { role: { name: 'guru' } }
    });

    const totalHalaqah = await prisma.halaqah.count();

    // Get halaqah with detailed info
    const halaqahList = await prisma.halaqah.findMany({
      include: {
        guru: {
          select: { id: true, namaLengkap: true }
        },
        _count: {
          select: { santri: true }
        }
      }
    });

    // Get detailed halaqah data with santri progress
    const halaqahWithDetails = await Promise.all(
      halaqahList.map(async (halaqah) => {
        // Get santri in this halaqah
        const santriInHalaqah = await prisma.halaqahSantri.findMany({
          where: { halaqahId: halaqah.id },
          include: {
            santri: {
              include: {
                Hafalan: {
                  orderBy: { tanggal: 'desc' },
                  take: 30 // Last 30 days
                },
                Absensi: {
                  where: {
                    tanggal: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                  }
                },
                Prestasi: {
                  where: { validated: true },
                  orderBy: { tahun: 'desc' }
                },
                Ujian: {
                  orderBy: { tanggal: 'desc' },
                  take: 5
                },
                HalaqahSantri: {
                  where: { halaqahId: halaqah.id },
                  include: {
                    halaqah: {
                      include: {
                        guru: {
                          select: { namaLengkap: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Calculate statistics for this halaqah
        const santriStats = santriInHalaqah.map((relation: any) => {
          const santri = relation.santri;
          const totalHafalan = santri.Hafalan.length;
          const attendanceRate = santri.Absensi.length > 0 ?
            Math.round((santri.Absensi.filter((a: any) => a.status === 'masuk').length / santri.Absensi.length) * 100) : 0;
          const avgNilaiUjian = santri.Ujian.length > 0 ?
            Math.round(santri.Ujian.reduce((sum: number, u: any) => sum + u.nilai, 0) / santri.Ujian.length) : 0;

          return {
            id: santri.id,
            namaLengkap: santri.namaLengkap,
            totalHafalan,
            attendanceRate,
            avgNilaiUjian,
            prestasiCount: santri.Prestasi.length
          };
        });

        const avgAttendance = santriStats.length > 0 ?
          Math.round(santriStats.reduce((sum, s) => sum + s.attendanceRate, 0) / santriStats.length) : 0;
        const avgNilai = santriStats.length > 0 ?
          Math.round(santriStats.reduce((sum, s) => sum + s.avgNilaiUjian, 0) / santriStats.length) : 0;

        return {
          ...halaqah,
          santriCount: santriInHalaqah.length,
          avgAttendance,
          avgNilai,
          santri: santriStats
        };
      })
    );

    // Get recent announcements
    const pengumuman = await prisma.pengumuman.findMany({
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    // Calculate global attendance rate (last 30 days)
    const recentAbsensi = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const globalAttendanceRate = recentAbsensi.length > 0 ?
      Math.round((recentAbsensi.filter(a => a.status === 'masuk').length / recentAbsensi.length) * 100) : 0;

    // Calculate average hafalan progress (last 7 days)
    const recentHafalan = await prisma.hafalan.findMany({
      where: {
        tanggal: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const avgWeeklyHafalan = recentHafalan.length > 0 ?
      Math.round(recentHafalan.length / 7) : 0; // Average per day

    return NextResponse.json({
      overview: {
        totalSantri,
        totalGuru,
        totalHalaqah,
        globalAttendanceRate,
        avgWeeklyHafalan
      },
      halaqahList: halaqahWithDetails,
      pengumuman
    });

  } catch (error) {
    console.error("Dashboard yayasan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}