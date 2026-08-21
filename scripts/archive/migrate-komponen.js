// Satu kali jalan: pindahkan isi tabel KomponenPenilaianJenis ke KomponenPenilaian
// (jenisUjianId diisi, templateUjianId null, nama -> namaKomponen, bobot -> bobotNilai).
// JALANKAN SEBELUM `prisma db push` (yang akan drop tabel KomponenPenilaianJenis).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT id, "jenisUjianId", nama, bobot, deskripsi, urutan FROM "KomponenPenilaianJenis"'
  );
  console.log(`KomponenPenilaianJenis rows ditemukan: ${rows.length}`);

  let created = 0;
  let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.komponenPenilaian.findFirst({
      where: { jenisUjianId: r.jenisUjianId, namaKomponen: r.nama },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.komponenPenilaian.create({
      data: {
        jenisUjianId: r.jenisUjianId,
        namaKomponen: r.nama,
        bobotNilai: Number(r.bobot),
        nilaiMaksimal: 100,
        nilaiMinimal: 0,
        deskripsi: r.deskripsi,
        urutan: r.urutan ?? 1,
        isActive: true,
      },
    });
    created++;
  }
  console.log(`Migrasi: ${created} dibuat, ${skipped} sudah ada.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
