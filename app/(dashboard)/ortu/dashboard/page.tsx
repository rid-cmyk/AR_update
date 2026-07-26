import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import OrtuDashboardClient from "./OrtuDashboardClient";

export const dynamic = 'force-dynamic';

export default async function OrtuDashboardPage() {
  const { user, error } = await getAuthUser();

  if (error || !user) {
    redirect("/login");
  }

  // Check for both 'ortu' and 'orang_tua' role names
  const isOrtu = user.role.name === 'ortu';
  if (!isOrtu) {
    redirect("/dashboard");
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
      id: santri.id,
      username: santri.username,
      namaLengkap: santri.namaLengkap,
      foto: santri.foto,
      role: santri.role,
      hafalanProgress: totalHafalan > 0 ? Math.min(Math.round((totalHafalan / 30) * 100), 100) : 0,
      attendanceRate: totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0,
      totalPrestasi: santri.Prestasi.length,
      lastActivity: santri.Hafalan[0]?.tanggal ? new Date(santri.Hafalan[0].tanggal).toISOString() : 
                    santri.Absensi[0]?.tanggal ? new Date(santri.Absensi[0].tanggal).toISOString() : new Date().toISOString()
    };
  });

  // Calculate overview statistics
  const totalChildren = anakList.length;
  
  let totalHafalan = 0;
  let totalAbsensiMasuk = 0;
  let totalAbsensi = 0;
  let totalPrestasi = 0;

  orangTuaSantriRelations.forEach(relation => {
    const santri = relation.santri;
    totalHafalan += santri.Hafalan.length;
    totalAbsensiMasuk += santri.Absensi.filter(a => a.status === 'masuk').length;
    totalAbsensi += santri.Absensi.length;
    totalPrestasi += santri.Prestasi.length;
  });

  const avgHafalanProgress = totalChildren > 0 ? Math.round((totalHafalan / totalChildren) * 10) / 10 : 0;
  const avgAttendanceRate = totalAbsensi > 0 ? Math.round((totalAbsensiMasuk / totalAbsensi) * 100) : 0;

  const data = {
    children: anakList,
    overview: {
      totalChildren,
      avgHafalanProgress,
      avgAttendanceRate,
      totalPrestasi
    }
  };

  return <OrtuDashboardClient data={data} />;
}