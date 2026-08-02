import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { withAuth } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get all table information from Prisma schema
    const tables = [
      {
        name: 'User',
        displayName: 'Users (Pengguna)',
        category: 'core',
        description: 'Data pengguna sistem (admin, guru, santri, ortu, yayasan)'
      },
      {
        name: 'Role',
        displayName: 'Roles (Peran)',
        category: 'core',
        description: 'Peran dan hak akses pengguna'
      },
      {
        name: 'Halaqah',
        displayName: 'Halaqah',
        category: 'data',
        description: 'Data halaqah dan pembagian kelas'
      },
      {
        name: 'HalaqahSantri',
        displayName: 'Halaqah Santri',
        category: 'data',
        description: 'Relasi santri dengan halaqah'
      },
      {
        name: 'Hafalan',
        displayName: 'Data Hafalan',
        category: 'data',
        description: 'Progress hafalan santri'
      },
      {
        name: 'TargetHafalan',
        displayName: 'Target Hafalan',
        category: 'data',
        description: 'Target hafalan yang ditetapkan'
      },
      {
        name: 'Absensi',
        displayName: 'Absensi',
        category: 'data',
        description: 'Data kehadiran santri'
      },
      {
        name: 'Prestasi',
        displayName: 'Prestasi',
        category: 'data',
        description: 'Pencapaian dan prestasi santri'
      },
      {
        name: 'UjianSantri',
        displayName: 'Ujian Santri',
        category: 'data',
        description: 'Hasil ujian santri (termasuk ujian guru)'
      },
      {
        name: 'Pengumuman',
        displayName: 'Pengumuman',
        category: 'system',
        description: 'Pengumuman dan notifikasi'
      },
      {
        name: 'PengumumanRead',
        displayName: 'Status Baca Pengumuman',
        category: 'system',
        description: 'Status baca pengumuman per user'
      },
      {
        name: 'OrangTuaSantri',
        displayName: 'Relasi Orang Tua - Santri',
        category: 'data',
        description: 'Hubungan orang tua dengan santri'
      },
      {
        name: 'Jadwal',
        displayName: 'Jadwal',
        category: 'system',
        description: 'Jadwal kegiatan dan pembelajaran'
      },
      {
        name: 'Notifikasi',
        displayName: 'Notifikasi',
        category: 'system',
        description: 'Sistem notifikasi'
      },
      {
        name: 'AuditLog',
        displayName: 'Audit Log',
        category: 'logs',
        description: 'Log aktivitas sistem'
      },
      {
        name: 'ForgotPasscode',
        displayName: 'Forgot Passcode Requests',
        category: 'logs',
        description: 'Permintaan reset passcode'
      },
      {
        name: 'TahunAjaran',
        displayName: 'Tahun Ajaran',
        category: 'system',
        description: 'Data tahun ajaran'
      },
      {
        name: 'TemplateUjian',
        displayName: 'Template Ujian',
        category: 'system',
        description: 'Template untuk ujian'
      },
      {
        name: 'TemplateRaport',
        displayName: 'Template Raport',
        category: 'system',
        description: 'Template untuk raport'
      },
      {
        name: 'RaportSantri',
        displayName: 'Raport Santri',
        category: 'data',
        description: 'Raport dan laporan santri'
      },
      {
        name: 'JenisUjian',
        displayName: 'Jenis Ujian',
        category: 'system',
        description: 'Kategori dan jenis ujian'
      },
      {
        name: 'KomponenPenilaian',
        displayName: 'Komponen Penilaian',
        category: 'system',
        description: 'Komponen penilaian ujian'
      },
      {
        name: 'GuruPermission',
        displayName: 'Permission Guru',
        category: 'system',
        description: 'Hak akses guru'
      }
    ];

    // Get actual record counts and sizes
    const tablesWithStats = await Promise.all(
      tables.map(async (table) => {
        try {
          // Get record count using raw query
          const countResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM "${table.name}"`
          ) as Record<string, unknown>[];
          
          const recordCount = Number(countResult[0]?.count || 0);
          
          // Estimate size (rough calculation)
          const estimatedSize = recordCount < 100 ? '< 1 KB' :
                               recordCount < 1000 ? '< 10 KB' :
                               recordCount < 10000 ? '< 100 KB' :
                               recordCount < 100000 ? '< 1 MB' : '> 1 MB';

          return {
            ...table,
            recordCount,
            size: estimatedSize,
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error getting stats for table ${table.name}:`, error);
          return {
            ...table,
            recordCount: 0,
            size: 'Unknown',
            lastUpdated: new Date().toISOString()
          };
        }
      })
    );

    return NextResponse.json({
      tables: tablesWithStats,
      totalTables: tablesWithStats.length,
      totalRecords: tablesWithStats.reduce((sum, t) => sum + t.recordCount, 0)
    });

  } catch (error) {
    console.error('Error fetching database info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database information' },
      { status: 500 }
    );
  }
}