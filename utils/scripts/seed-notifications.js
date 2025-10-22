const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🔔 Mulai menambahkan data notifikasi...');

    // Get some users for testing
    const santriUsers = await prisma.user.findMany({
      where: { role: { name: 'santri' } },
      take: 3
    });

    const guruUsers = await prisma.user.findMany({
      where: { role: { name: 'guru' } },
      take: 2
    });

    const adminUsers = await prisma.user.findMany({
      where: { role: { name: 'admin' } },
      take: 1
    });

    // Create sample notifications for santri
    const santriNotifications = [
      {
        pesan: 'Target hafalan baru telah ditetapkan untuk Anda',
        type: 'hafalan',
        refId: 1
      },
      {
        pesan: 'Jadwal halaqah telah diperbarui',
        type: 'user',
        refId: null
      },
      {
        pesan: 'Raport semester ini sudah tersedia',
        type: 'rapot',
        refId: 1
      }
    ];

    for (const santri of santriUsers) {
      for (const notif of santriNotifications) {
        await prisma.notifikasi.create({
          data: {
            ...notif,
            userId: santri.id
          }
        });
      }
    }

    // Create sample notifications for guru
    const guruNotifications = [
      {
        pesan: 'Ada santri baru di halaqah Anda',
        type: 'user',
        refId: null
      },
      {
        pesan: 'Reminder: Input hafalan santri hari ini',
        type: 'hafalan',
        refId: null
      }
    ];

    for (const guru of guruUsers) {
      for (const notif of guruNotifications) {
        await prisma.notifikasi.create({
          data: {
            ...notif,
            userId: guru.id
          }
        });
      }
    }

    // Create sample notifications for admin
    const adminNotifications = [
      {
        pesan: 'Backup database berhasil dilakukan',
        type: 'user',
        refId: null
      },
      {
        pesan: 'Ada prestasi baru yang perlu divalidasi',
        type: 'user',
        refId: null
      }
    ];

    for (const admin of adminUsers) {
      for (const notif of adminNotifications) {
        await prisma.notifikasi.create({
          data: {
            ...notif,
            userId: admin.id
          }
        });
      }
    }

    // Create sample pengumuman
    const superAdmin = await prisma.user.findFirst({
      where: { role: { name: 'super-admin' } }
    });

    if (superAdmin) {
      const samplePengumuman = [
        {
          judul: 'Pengumuman Libur Hari Raya',
          isi: 'Kegiatan halaqah akan diliburkan selama 3 hari dalam rangka perayaan Hari Raya Idul Fitri.',
          targetAudience: 'semua',
          createdBy: superAdmin.id
        },
        {
          judul: 'Evaluasi Bulanan Santri',
          isi: 'Evaluasi bulanan untuk semua santri akan dilaksanakan minggu depan. Harap persiapkan diri dengan baik.',
          targetAudience: 'santri',
          createdBy: superAdmin.id
        },
        {
          judul: 'Rapat Koordinasi Guru',
          isi: 'Rapat koordinasi guru akan dilaksanakan hari Jumat pukul 14.00 WIB. Kehadiran wajib.',
          targetAudience: 'guru',
          createdBy: superAdmin.id
        }
      ];

      for (const pengumuman of samplePengumuman) {
        await prisma.pengumuman.create({
          data: pengumuman
        });
      }

      console.log('✅ Sample pengumuman berhasil ditambahkan');
    }

    console.log('🎉 Data notifikasi berhasil ditambahkan!');
    console.log(`📊 Ringkasan:`);
    console.log(`   - Notifikasi santri: ${santriUsers.length * santriNotifications.length}`);
    console.log(`   - Notifikasi guru: ${guruUsers.length * guruNotifications.length}`);
    console.log(`   - Notifikasi admin: ${adminUsers.length * adminNotifications.length}`);
    console.log(`   - Pengumuman: 3`);

  } catch (error) {
    console.error('❌ Error saat menambahkan notifikasi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi
seedNotifications()
  .catch((error) => {
    console.error('❌ Script gagal dijalankan:', error);
    process.exit(1);
  });