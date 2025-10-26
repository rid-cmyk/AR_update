import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/database/prisma';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Ensure user is ortu (check both 'ortu' and 'orang_tua' for compatibility)
    if (user.role.name !== 'ortu' && user.role.name !== 'orang_tua') {
      return ApiResponse.forbidden('Access denied');
    }

    // Get anak-anak dari orang tua ini
    const anakList = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: user.id },
      include: {
        santri: {
          include: {
            Hafalan: {
              orderBy: { tanggal: 'desc' },
              take: 10
            },
            TargetHafalan: {
              orderBy: { deadline: 'asc' }
            },
            Absensi: {
              include: {
                jadwal: {
                  include: {
                    halaqah: true
                  }
                }
              },
              orderBy: { tanggal: 'desc' },
              take: 10
            },
            Prestasi: {
              where: { validated: true },
              orderBy: { tahun: 'desc' }
            },
            Ujian: {
              orderBy: { tanggal: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    // Transform data sesuai dengan interface yang diharapkan frontend
    const transformedAnakList = anakList.map(item => ({
      id: item.santri.id,
      namaLengkap: item.santri.namaLengkap,
      username: item.santri.username,
      Hafalan: item.santri.Hafalan.map(h => ({
        id: h.id,
        tanggal: h.tanggal.toISOString().split('T')[0],
        surat: h.surat,
        ayatMulai: h.ayatMulai,
        ayatSelesai: h.ayatSelesai,
        status: h.status
      })),
      TargetHafalan: item.santri.TargetHafalan.map(t => ({
        id: t.id,
        surat: t.surat,
        ayatTarget: t.ayatTarget,
        deadline: t.deadline.toISOString().split('T')[0],
        status: t.status
      })),
      Absensi: item.santri.Absensi.map(a => ({
        id: a.id,
        status: a.status,
        tanggal: a.tanggal.toISOString().split('T')[0],
        jadwal: {
          halaqah: {
            namaHalaqah: a.jadwal.halaqah.namaHalaqah
          }
        }
      })),
      Prestasi: item.santri.Prestasi.map(p => ({
        id: p.id,
        namaPrestasi: p.namaPrestasi,
        keterangan: p.keterangan || '',
        tahun: p.tahun,
        validated: p.validated
      })),
      Ujian: item.santri.Ujian.map(u => ({
        id: u.id,
        jenis: u.jenis,
        nilai: u.nilai,
        tanggal: u.tanggal.toISOString().split('T')[0]
      }))
    }));

    // Get pengumuman untuk orang tua
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        OR: [
          { targetAudience: 'semua' },
          { targetAudience: 'guru' }, // Orang tua juga bisa lihat pengumuman guru
          { targetAudience: 'santri' } // Orang tua juga bisa lihat pengumuman santri
        ]
      },
      include: {
        dibacaOleh: {
          where: { userId: user.id }
        }
      },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    // Transform pengumuman data
    const transformedPengumuman = pengumuman.map(p => ({
      id: p.id,
      judul: p.judul,
      isi: p.isi,
      tanggal: p.tanggal.toISOString().split('T')[0],
      targetAudience: p.targetAudience,
      dibacaOleh: p.dibacaOleh
    }));

    return NextResponse.json({
      anakList: transformedAnakList,
      pengumuman: transformedPengumuman
    });

  } catch (error) {
    console.error("Error fetching ortu dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}