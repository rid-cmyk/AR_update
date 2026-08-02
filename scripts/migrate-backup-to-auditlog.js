// Satu kali jalan: pindahkan isi tabel Backup ke AuditLog (action="BACKUP").
// JALANKAN SEBELUM `prisma db push` (yang akan drop tabel Backup).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const backups = await prisma.$queryRawUnsafe(
    'SELECT id, "namaFile", "tanggalBackup" FROM "Backup"'
  );
  console.log(`Backup rows ditemukan: ${backups.length}`);

  let created = 0;
  let skipped = 0;
  for (const b of backups) {
    const exists = await prisma.auditLog.findFirst({
      where: { action: 'BACKUP', keterangan: b.namaFile },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP',
        keterangan: b.namaFile,
        userId: 1,
        tanggal: new Date(b.tanggalBackup),
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
