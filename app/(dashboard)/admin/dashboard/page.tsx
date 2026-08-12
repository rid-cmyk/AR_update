import { redirect } from 'next/navigation'
import { prisma } from '@/lib/database/prisma'
import { getAuthUser } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { user, error } = await getAuthUser()
  
  if (error || !user) {
    redirect('/login')
  }

  const now = new Date()

  // Date ranges
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  const lastWeekStart = new Date(now)
  lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
  lastWeekStart.setHours(0, 0, 0, 0)
  const lastWeekEnd = new Date(now)
  lastWeekEnd.setDate(now.getDate() - now.getDay())
  lastWeekEnd.setHours(23, 59, 59, 999)

  // Parallel queries for all stat cards and trends
  const [
    totalTemplateUjian,
    totalTemplateRaport,
    templateBulanIni,
    templateBulanLalu,
    totalUjianAktif,
    ujianMingguIni,
    ujianMingguLalu,
    totalLaporan,
    laporanBulanIni,
    laporanBulanLalu,
    totalPengguna,
    penggunaBaru,
    penggunaBulanLalu,
    halaqahList,
    halaqahListPrev
  ] = await Promise.all([
    prisma.templateUjian.count(),
    prisma.templateRaport.count(),
    prisma.templateUjian.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.templateUjian.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" } } }),
    prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" }, createdAt: { gte: startOfWeek } } }),
    prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" }, createdAt: { gte: lastWeekStart, lte: lastWeekEnd } } }),
    prisma.raportSantri.count(),
    prisma.raportSantri.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.raportSantri.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    // Halaqah: total santri + santri aktif 30 hari terakhir (dihitung via _count ber-filter)
    prisma.halaqah.findMany({
      select: {
        id: true,
        namaHalaqah: true,
        santri: { select: { id: true } },
        _count: {
          select: {
            santri: {
              where: {
                santri: {
                  Hafalan: { some: { tanggal: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }
                }
              }
            }
          }
        }
      },
      take: 4,
    }),
    // Halaqah: santri aktif pada 30 hari SEBELUMNYA (untuk menghitung trend yang nyata)
    prisma.halaqah.findMany({
      select: {
        id: true,
        _count: {
          select: {
            santri: {
              where: {
                santri: {
                  Hafalan: {
                    some: {
                      tanggal: {
                        gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
                        lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      take: 4,
    })
  ])

  // Calculate trends (percentage change)
  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const prevByHalaqah = new Map(halaqahListPrev.map((h) => [h.id, h._count.santri]))

  const halaqahPerformance = halaqahList.map((h) => {
    const santriCount = h.santri.length
    const santriAktif = h._count.santri
    const hafalanRate =
      santriCount > 0
        ? Math.round((santriAktif / santriCount) * 100)
        : 0
    const prevRate =
      santriCount > 0
        ? Math.round(((prevByHalaqah.get(h.id) || 0) / santriCount) * 100)
        : 0

    return {
      nama: h.namaHalaqah,
      santri: santriCount,
      nilai: hafalanRate,
      trend: calcTrend(hafalanRate, prevRate).toString(),
    }
  })

  const data = {
    stats: {
      totalTemplate: {
        value: totalTemplateUjian + totalTemplateRaport,
        tag: `+${templateBulanIni} bulan ini`,
        tagColor: "blue",
      },
      ujianAktif: {
        value: totalUjianAktif,
        tag: `+${ujianMingguIni} minggu ini`,
        tagColor: "green",
      },
      dataLaporan: {
        value: totalLaporan,
        tag: `${totalLaporan} tersedia`,
        tagColor: "purple",
      },
      totalPengguna: {
        value: totalPengguna,
        tag: `+${penggunaBaru} baru`,
        tagColor: "orange",
      },
    },
    tren: {
      ujianMingguIni: {
        value: ujianMingguIni,
        trend: calcTrend(ujianMingguIni, ujianMingguLalu),
      },
      raportBulanIni: {
        value: laporanBulanIni,
        trend: calcTrend(laporanBulanIni, laporanBulanLalu),
      },
      templateBaru: {
        value: templateBulanIni,
        trend: calcTrend(templateBulanIni, templateBulanLalu),
      },
      penggunaBaru: {
        value: penggunaBaru,
        trend: calcTrend(penggunaBaru, penggunaBulanLalu),
      },
    },
    halaqahPerformance,
    lastUpdated: now.toISOString(),
  }

  return <AdminDashboardClient data={data} />
}
