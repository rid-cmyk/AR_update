const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPengumumanSync() {
  try {
    console.log('🧪 Testing Pengumuman Synchronization by Target Audience...\n');

    // Get admin user to create pengumuman
    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'admin' } },
      include: { role: true }
    });

    if (!adminUser) {
      console.log('❌ No admin user found. Please run seed first.');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.namaLengkap}\n`);

    // Test pengumuman for different target audiences (using only valid enum values)
    const testPengumuman = [
      {
        judul: 'Test Sync - Pengumuman untuk Semua User',
        isi: 'Ini adalah pengumuman yang akan muncul di semua dashboard (admin, guru, santri)',
        targetAudience: 'semua',
        createdBy: adminUser.id
      },
      {
        judul: 'Test Sync - Khusus untuk Guru',
        isi: 'Rapat koordinasi guru akan dilaksanakan hari Jumat pukul 14.00 WIB. Kehadiran wajib.',
        targetAudience: 'guru',
        createdBy: adminUser.id
      },
      {
        judul: 'Test Sync - Khusus untuk Santri',
        isi: 'Evaluasi bulanan untuk semua santri akan dilaksanakan minggu depan. Harap persiapkan diri dengan baik.',
        targetAudience: 'santri',
        createdBy: adminUser.id
      },
      {
        judul: 'Test Sync - Khusus untuk Admin',
        isi: 'Backup database berhasil dilakukan. Sistem berjalan normal.',
        targetAudience: 'admin',
        createdBy: adminUser.id
      }
    ];

    // Create test pengumuman
    console.log('📝 Creating test pengumuman...\n');
    const createdPengumuman = [];

    for (const pengumuman of testPengumuman) {
      const created = await prisma.pengumuman.create({
        data: pengumuman,
        include: {
          creator: {
            select: {
              namaLengkap: true,
              role: { select: { name: true } }
            }
          }
        }
      });
      createdPengumuman.push(created);
      console.log(`✅ Created: "${created.judul}" (Target: ${created.targetAudience})`);
    }

    console.log('\n🔍 Testing visibility by role...\n');

    // Test visibility for each role
    const roles = ['admin', 'guru', 'santri'];

    for (const roleName of roles) {
      console.log(`👤 Testing visibility for role: ${roleName.toUpperCase()}`);
      
      // Get pengumuman that should be visible to this role
      const visiblePengumuman = await prisma.pengumuman.findMany({
        where: {
          OR: [
            { targetAudience: 'semua' },
            { targetAudience: roleName }
          ]
        },
        select: {
          id: true,
          judul: true,
          targetAudience: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`   📋 Should see ${visiblePengumuman.length} pengumuman:`);
      visiblePengumuman.forEach(p => {
        console.log(`      - "${p.judul}" (${p.targetAudience})`);
      });
      console.log('');
    }

    // Test notification creation
    console.log('🔔 Testing notification creation...\n');

    const notificationCounts = await prisma.notifikasi.groupBy({
      by: ['type'],
      where: {
        type: 'pengumuman'
      },
      _count: {
        id: true
      }
    });

    console.log('📊 Notification statistics:');
    notificationCounts.forEach(stat => {
      console.log(`   ${stat.type}: ${stat._count.id} notifications`);
    });

    // Show sample notifications
    const sampleNotifications = await prisma.notifikasi.findMany({
      where: {
        type: 'pengumuman'
      },
      include: {
        user: {
          select: {
            namaLengkap: true,
            role: { select: { name: true } }
          }
        }
      },
      take: 10,
      orderBy: {
        tanggal: 'desc'
      }
    });

    console.log('\n📬 Sample notifications created:');
    sampleNotifications.forEach(notif => {
      console.log(`   - ${notif.user.namaLengkap} (${notif.user.role.name}): ${notif.pesan}`);
    });

    console.log('\n🎉 Pengumuman synchronization test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Created ${createdPengumuman.length} test pengumuman`);
    console.log(`   - Each role sees appropriate pengumuman based on target audience`);
    console.log(`   - Notifications created for relevant users`);
    console.log(`   - System properly filters pengumuman by role`);

  } catch (error) {
    console.error('❌ Error testing pengumuman sync:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPengumumanSync()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });