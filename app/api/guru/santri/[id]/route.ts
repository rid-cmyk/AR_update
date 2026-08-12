import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'
import { JUZ_MAPPING, JuzMapping } from '@/utils/juz-mapping'

// Cari juz dari surat + ayat hafalan terakhir (Hafalan tidak menyimpan juz langsung)
function getJuzForHafalan(surat: string, ayatSelesai: number): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  const suratNorm = norm(surat);
  let best: JuzMapping | null = null;
  for (const m of JUZ_MAPPING) {
    if (norm(m.suratName) !== suratNorm) continue;
    if (ayatSelesai >= m.ayatMulai && ayatSelesai <= m.ayatSelesai) {
      best = m;
      break;
    }
    if (!best || m.juzNumber > best.juzNumber) best = m;
  }
  return best?.juzNumber || 0;
}

// GET detail santri milik guru (scope: halaqah guru; admin/super_admin lihat semua)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const santriId = parseInt(id);
    if (isNaN(santriId)) {
      return NextResponse.json(
        { success: false, message: 'ID santri tidak valid' },
        { status: 400 }
      );
    }

    // Guru: santri harus terdaftar di halaqah miliknya
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        santriId,
        ...(user.role.name === 'guru' ? { halaqah: { guruId: user.id } } : {})
      },
      include: {
        santri: { include: { role: true } },
        halaqah: { select: { id: true, namaHalaqah: true } }
      },
      orderBy: { id: 'desc' }
    });

    if (!halaqahSantri) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan dalam halaqah Anda' },
        { status: 404 }
      );
    }

    const latestHafalan = await prisma.hafalan.findFirst({
      where: { santriId },
      orderBy: { tanggal: 'desc' },
      select: { surat: true, ayatSelesai: true }
    });

    const juzTerakhir = getJuzForHafalan(latestHafalan?.surat || '', latestHafalan?.ayatSelesai || 0);
    const halamanTerakhir = 0;
    const progress = Math.min(100, (juzTerakhir / 30) * 100);
    const jumlahHafalan = await prisma.hafalan.count({ where: { santriId } });

    return NextResponse.json({
      success: true,
      data: {
        id: String(halaqahSantri.santri.id),
        nama: halaqahSantri.santri.namaLengkap,
        namaLengkap: halaqahSantri.santri.namaLengkap,
        username: halaqahSantri.santri.username,
        kelas: halaqahSantri.halaqah.namaHalaqah,
        halaqah: halaqahSantri.halaqah.namaHalaqah,
        halaqahId: halaqahSantri.halaqah.id,
        juzTerakhir,
        halamanTerakhir,
        progress,
        jumlahHafalan,
        status: 'aktif'
      },
      message: 'Data santri berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching santri detail:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data santri'
      },
      { status: 500 }
    )
  }
}
