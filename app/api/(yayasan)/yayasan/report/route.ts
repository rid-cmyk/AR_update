import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Get current month data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Generate comprehensive report data
    const reportData = {
      periode: {
        bulan: now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      },
      ringkasan: {} as any,
      halaqahReport: [] as any[],
      santriReport: [] as any[],
      statistikBulanan: {} as any
    };

    // Get summary statistics
    const totalSantri = await prisma.user.count({
      where: { role: { name: 'santri' } }
    });

    const totalGuru = await prisma.user.count({
      where: { role: { name: 'guru' } }
    });

    const totalHalaqah = await prisma.halaqah.count();

    // Monthly attendance
    const monthlyAbsensi = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const attendanceRate = monthlyAbsensi.length > 0 ?
      Math.round((monthlyAbsensi.filter(a => a.status === 'masuk').length / monthlyAbsensi.length) * 100) : 0;

    // Monthly hafalan
    const monthlyHafalan = await prisma.hafalan.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Monthly ujian
    const monthlyUjian = await prisma.ujian.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const avgNilaiUjian = monthlyUjian.length > 0 ?
      Math.round(monthlyUjian.reduce((sum, u) => sum + u.nilai, 0) / monthlyUjian.length) : 0;

    reportData.ringkasan = {
      totalSantri,
      totalGuru,
      totalHalaqah,
      totalAbsensi: monthlyAbsensi.length,
      attendanceRate,
      totalHafalan: monthlyHafalan.length,
      totalUjian: monthlyUjian.length,
      avgNilaiUjian
    };

    // Halaqah detailed report
    const halaqahList = await prisma.halaqah.findMany({
      include: {
        guru: { select: { namaLengkap: true } },
        _count: { select: { santri: true } }
      }
    });

    for (const halaqah of halaqahList) {
      // Get santri in this halaqah
      const santriInHalaqah = await prisma.halaqahSantri.findMany({
        where: { halaqahId: halaqah.id },
        include: {
          santri: {
            include: {
              Hafalan: {
                where: {
                  tanggal: { gte: startOfMonth, lte: endOfMonth }
                }
              },
              Absensi: {
                where: {
                  tanggal: { gte: startOfMonth, lte: endOfMonth }
                }
              },
              Ujian: {
                where: {
                  tanggal: { gte: startOfMonth, lte: endOfMonth }
                }
              }
            }
          }
        }
      });

      const halaqahStats = {
        namaHalaqah: halaqah.namaHalaqah,
        guru: halaqah.guru.namaLengkap,
        jumlahSantri: santriInHalaqah.length,
        totalHafalan: santriInHalaqah.reduce((sum, s) => sum + s.santri.Hafalan.length, 0),
        totalAbsensi: santriInHalaqah.reduce((sum, s) => sum + s.santri.Absensi.length, 0),
        kehadiran: santriInHalaqah.length > 0 ?
          Math.round(santriInHalaqah.reduce((sum, s) =>
            sum + (s.santri.Absensi.filter(a => a.status === 'masuk').length / Math.max(s.santri.Absensi.length, 1)) * 100, 0
          ) / santriInHalaqah.length) : 0,
        rataRataNilai: santriInHalaqah.length > 0 ?
          Math.round(santriInHalaqah.reduce((sum, s) =>
            sum + (s.santri.Ujian.length > 0 ?
              s.santri.Ujian.reduce((uSum, u) => uSum + u.nilai, 0) / s.santri.Ujian.length : 0), 0
          ) / santriInHalaqah.length) : 0
      };

      reportData.halaqahReport.push(halaqahStats);
    }

    // Top performing santri
    const topSantri = await prisma.user.findMany({
      where: { role: { name: 'santri' } },
      include: {
        Hafalan: {
          where: { tanggal: { gte: startOfMonth, lte: endOfMonth } }
        },
        Ujian: {
          where: { tanggal: { gte: startOfMonth, lte: endOfMonth } }
        },
        Prestasi: {
          where: { validated: true, tahun: now.getFullYear() }
        },
        HalaqahSantri: {
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
      },
      take: 10
    });

    reportData.santriReport = topSantri.map(santri => ({
      namaLengkap: santri.namaLengkap,
      totalHafalan: santri.Hafalan.length,
      rataRataNilai: santri.Ujian.length > 0 ?
        Math.round(santri.Ujian.reduce((sum, u) => sum + u.nilai, 0) / santri.Ujian.length) : 0,
      prestasi: santri.Prestasi.length
    }));

    // Monthly statistics by day
    const dailyStats = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), i);
      const dayHafalan = monthlyHafalan.filter(h =>
        new Date(h.tanggal).toDateString() === date.toDateString()
      ).length;

      const dayAbsensi = monthlyAbsensi.filter(a =>
        new Date(a.tanggal).toDateString() === date.toDateString()
      );

      dailyStats.push({
        tanggal: i,
        hafalan: dayHafalan,
        absensi: dayAbsensi.length,
        kehadiran: dayAbsensi.length > 0 ?
          Math.round((dayAbsensi.filter(a => a.status === 'masuk').length / dayAbsensi.length) * 100) : 0
      });
    }

    reportData.statistikBulanan = {
      dailyStats,
      trendHafalan: monthlyHafalan.length,
      trendKehadiran: attendanceRate
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST endpoint for PDF generation
export async function POST(req: NextRequest) {
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

    // Get report data first
    const reportData = await generateReportData();

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Laporan Bulanan Pesantren Tahfidz', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Periode: ${reportData.periode.bulan}`, 105, 30, { align: 'center' });
    doc.text(`Tanggal: ${reportData.periode.startDate} - ${reportData.periode.endDate}`, 105, 35, { align: 'center' });

    // Ringkasan
    doc.setFontSize(14);
    doc.text('Ringkasan', 20, 50);

    const summaryData = [
      ['Total Santri', reportData.ringkasan.totalSantri.toString()],
      ['Total Guru', reportData.ringkasan.totalGuru.toString()],
      ['Total Halaqah', reportData.ringkasan.totalHalaqah.toString()],
      ['Total Absensi', reportData.ringkasan.totalAbsensi.toString()],
      ['Tingkat Kehadiran', `${reportData.ringkasan.attendanceRate}%`],
      ['Total Hafalan', reportData.ringkasan.totalHafalan.toString()],
      ['Total Ujian', reportData.ringkasan.totalUjian.toString()],
      ['Rata-rata Nilai', `${reportData.ringkasan.avgNilaiUjian}/100`]
    ];

    (doc as any).autoTable({
      startY: 55,
      head: [['Item', 'Nilai']],
      body: summaryData,
      theme: 'grid'
    });

    // Halaqah Report
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Laporan per Halaqah', 20, 20);

    const halaqahTableData = reportData.halaqahReport.map(h => [
      h.namaHalaqah,
      h.guru,
      h.jumlahSantri.toString(),
      h.totalHafalan.toString(),
      h.totalAbsensi.toString(),
      `${h.kehadiran}%`,
      `${h.rataRataNilai}/100`
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['Halaqah', 'Guru', 'Santri', 'Hafalan', 'Absensi', 'Kehadiran', 'Rata-rata Nilai']],
      body: halaqahTableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fontSize: 9 }
    });

    // Top Santri
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Santri Terbaik', 20, 20);

    const santriTableData = reportData.santriReport.map(s => [
      s.namaLengkap,
      s.totalHafalan.toString(),
      `${s.rataRataNilai}/100`,
      s.prestasi.toString()
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['Nama Santri', 'Total Hafalan', 'Rata-rata Nilai', 'Prestasi']],
      body: santriTableData,
      theme: 'grid'
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Laporan Yayasan - Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, 105, 295, { align: 'center' });
    }

    // Convert to buffer and return
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-yayasan-${reportData.periode.bulan.toLowerCase().replace(' ', '-')}.pdf"`
      }
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to generate report data
async function generateReportData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const reportData = {
    periode: {
      bulan: now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    },
    ringkasan: {} as any,
    halaqahReport: [] as any[],
    santriReport: [] as any[],
    statistikBulanan: {} as any
  };

  // Get summary statistics
  const totalSantri = await prisma.user.count({
    where: { role: { name: 'santri' } }
  });

  const totalGuru = await prisma.user.count({
    where: { role: { name: 'guru' } }
  });

  const totalHalaqah = await prisma.halaqah.count();

  // Monthly attendance
  const monthlyAbsensi = await prisma.absensi.findMany({
    where: {
      tanggal: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const attendanceRate = monthlyAbsensi.length > 0 ?
    Math.round((monthlyAbsensi.filter(a => a.status === 'masuk').length / monthlyAbsensi.length) * 100) : 0;

  // Monthly hafalan
  const monthlyHafalan = await prisma.hafalan.findMany({
    where: {
      tanggal: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  // Monthly ujian
  const monthlyUjian = await prisma.ujian.findMany({
    where: {
      tanggal: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const avgNilaiUjian = monthlyUjian.length > 0 ?
    Math.round(monthlyUjian.reduce((sum, u) => sum + u.nilai, 0) / monthlyUjian.length) : 0;

  reportData.ringkasan = {
    totalSantri,
    totalGuru,
    totalHalaqah,
    totalAbsensi: monthlyAbsensi.length,
    attendanceRate,
    totalHafalan: monthlyHafalan.length,
    totalUjian: monthlyUjian.length,
    avgNilaiUjian
  };

  // Halaqah detailed report
  const halaqahList = await prisma.halaqah.findMany({
    include: {
      guru: { select: { namaLengkap: true } },
      _count: { select: { santri: true } }
    }
  });

  for (const halaqah of halaqahList) {
    const santriInHalaqah = await prisma.halaqahSantri.findMany({
      where: { halaqahId: halaqah.id },
      include: {
        santri: {
          include: {
            Hafalan: {
              where: {
                tanggal: { gte: startOfMonth, lte: endOfMonth }
              }
            },
            Absensi: {
              where: {
                tanggal: { gte: startOfMonth, lte: endOfMonth }
              }
            },
            Ujian: {
              where: {
                tanggal: { gte: startOfMonth, lte: endOfMonth }
              }
            }
          }
        }
      }
    });

    const halaqahStats = {
      namaHalaqah: halaqah.namaHalaqah,
      guru: halaqah.guru.namaLengkap,
      jumlahSantri: santriInHalaqah.length,
      totalHafalan: santriInHalaqah.reduce((sum, s) => sum + s.santri.Hafalan.length, 0),
      totalAbsensi: santriInHalaqah.reduce((sum, s) => sum + s.santri.Absensi.length, 0),
      kehadiran: santriInHalaqah.length > 0 ?
        Math.round(santriInHalaqah.reduce((sum, s) =>
          sum + (s.santri.Absensi.filter(a => a.status === 'masuk').length / Math.max(s.santri.Absensi.length, 1)) * 100, 0
        ) / santriInHalaqah.length) : 0,
      rataRataNilai: santriInHalaqah.length > 0 ?
        Math.round(santriInHalaqah.reduce((sum, s) =>
          sum + (s.santri.Ujian.length > 0 ?
            s.santri.Ujian.reduce((uSum, u) => uSum + u.nilai, 0) / s.santri.Ujian.length : 0), 0
        ) / santriInHalaqah.length) : 0
    };

    reportData.halaqahReport.push(halaqahStats);
  }

  // Top performing santri
  const topSantri = await prisma.user.findMany({
    where: { role: { name: 'santri' } },
    include: {
      Hafalan: {
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } }
      },
      Ujian: {
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } }
      },
      Prestasi: {
        where: { validated: true, tahun: now.getFullYear() }
      }
    },
    take: 10
  });

  reportData.santriReport = topSantri.map(santri => ({
    namaLengkap: santri.namaLengkap,
    totalHafalan: santri.Hafalan.length,
    rataRataNilai: santri.Ujian.length > 0 ?
      Math.round(santri.Ujian.reduce((sum, u) => sum + u.nilai, 0) / santri.Ujian.length) : 0,
    prestasi: santri.Prestasi.length
  }));

  return reportData;
}