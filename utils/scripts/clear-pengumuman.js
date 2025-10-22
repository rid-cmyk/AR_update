const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearPengumuman() {
    try {
        console.log('🗑️  Mulai menghapus semua data pengumuman...');

        // Hapus semua data PengumumanRead terlebih dahulu (karena ada foreign key constraint)
        const deletedReads = await prisma.pengumumanRead.deleteMany({});
        console.log(`✅ Berhasil menghapus ${deletedReads.count} data pembacaan pengumuman`);

        // Hapus semua data Pengumuman
        const deletedPengumuman = await prisma.pengumuman.deleteMany({});
        console.log(`✅ Berhasil menghapus ${deletedPengumuman.count} data pengumuman`);

        console.log('🎉 Semua data pengumuman berhasil dihapus!');
        console.log('📊 Ringkasan:');
        console.log(`   - Pengumuman dihapus: ${deletedPengumuman.count}`);
        console.log(`   - Data pembacaan dihapus: ${deletedReads.count}`);

    } catch (error) {
        console.error('❌ Error saat menghapus data pengumuman:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Jalankan fungsi
clearPengumuman()
    .catch((error) => {
        console.error('❌ Script gagal dijalankan:', error);
        process.exit(1);
    });