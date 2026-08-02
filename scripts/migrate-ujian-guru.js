// Satu kali jalan: pindahkan isi tabel UjianGuru ke UjianSantri.
// Butuh TemplateUjian & TahunAjaran aktif; bila tidak tersedia, baris dilewati dengan warning.
// JALANKAN SEBELUM `prisma db push` (yang akan drop tabel UjianGuru).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STATUS_MAP = {
  SELESAI: 'selesai',
  DRAFT: 'draft',
  SUBMITTED: 'diverifikasi',
  DIVERIFIKASI: 'diverifikasi',
  VERIFIED: 'diverifikasi',
  DITOLAK: 'ditolak',
  REJECTED: 'ditolak',
};

function mapStatus(status) {
  const key = String(status || 'SELESAI').toUpperCase();
  return STATUS_MAP[key] || 'selesai';
}

async function main() {
  const rows = await prisma.$queryRawUnsafe('SELECT * FROM "UjianGuru"');
  console.log(`UjianGuru rows ditemukan: ${rows.length}`);
  if (rows.length === 0) {
    console.log('Tidak ada data untuk dimigrasi.');
    return;
  }

  const tahun = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
  if (!tahun) throw new Error('Tidak ada TahunAjaran aktif. Buat dulu sebelum migrasi.');

  const templates = await prisma.templateUjian.findMany({
    select: { id: true, namaTemplate: true },
  });

  let created = 0;
  let skipped = 0;
  for (const r of rows) {
    let template = templates.find((t) =>
      t.namaTemplate.toLowerCase().includes(String(r.jenisUjian || '').toLowerCase())
    );
    if (!template && r.keterangan) {
      template = templates.find((t) =>
        t.namaTemplate.toLowerCase().includes(String(r.keterangan).toLowerCase())
      );
    }
    if (!template && templates.length > 0) template = templates[0];
    if (!template) {
      console.warn(`Skip ujianGuru id=${r.id}: tidak ada TemplateUjian yang cocok.`);
      skipped++;
      continue;
    }

    let nilaiDetail = null;
    if (r.catatan) {
      try {
        nilaiDetail = JSON.parse(r.catatan);
      } catch {
        nilaiDetail = { catatan: r.catatan };
      }
    }

    let pengaturan = null;
    if (r.pengaturan) {
      try {
        pengaturan = JSON.parse(r.pengaturan);
      } catch {
        pengaturan = { raw: r.pengaturan };
      }
    }

    await prisma.ujianSantri.create({
      data: {
        santriId: r.santriId,
        templateUjianId: template.id,
        tahunAjaranId: tahun.id,
        tanggalUjian: new Date(r.tanggalUjian),
        nilaiAkhir: r.nilai ?? r.totalNilai,
        statusUjian: mapStatus(r.status),
        catatanGuru: r.catatan,
        createdBy: r.guruId,
        guruId: r.guruId,
        jenisUjianLabel: r.jenisUjian,
        nilaiDetail,
        pengaturan,
        juzDari: r.juzMulai,
        juzSampai: r.juzSelesai,
      },
    });
    created++;
  }
  console.log(`Migrasi: ${created} dibuat, ${skipped} dilewati.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
