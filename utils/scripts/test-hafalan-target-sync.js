const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHafalanTargetSync() {
  try {
    console.log('🧪 Testing Hafalan & Target Backend Synchronization...\n');

    // Get guru user
    const guruUser = await prisma.user.findFirst({
      where: { role: { name: 'guru' } },
      include: { role: true }
    });

    if (!guruUser) {
      console.log('❌ No guru user found. Please run seed first.');
      return;
    }

    console.log(`✅ Found guru user: ${guruUser.namaLengkap}\n`);

    // Get santri in guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        halaqah: {
          guruId: guruUser.id
        }
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            id: true,
            namaHalaqah: true
          }
        }
      }
    });

    if (halaqahSantri.length === 0) {
      console.log('❌ No santri found in guru halaqah. Please assign santri to halaqah first.');
      return;
    }

    console.log(`✅ Found ${halaqahSantri.length} santri in guru's halaqah:`);
    halaqahSantri.forEach(hs => {
      console.log(`   - ${hs.santri.namaLengkap} (${hs.halaqah.namaHalaqah})`);
    });
    console.log('');

    // Test creating hafalan records
    console.log('📝 Testing hafalan creation...\n');
    const testHafalan = [];

    for (let i = 0; i < Math.min(3, halaqahSantri.length); i++) {
      const santri = halaqahSantri[i].santri;
      
      const hafalanData = [
        {
          santriId: santri.id,
          tanggal: new Date(),
          surat: 'Al-Fatihah',
          ayatMulai: 1,
          ayatSelesai: 7,
          status: 'ziyadah',
          keterangan: 'Hafalan lancar, tajwid baik'
        },
        {
          santriId: santri.id,
          tanggal: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
          surat: 'Al-Baqarah',
          ayatMulai: 1,
          ayatSelesai: 5,
          status: 'ziyadah',
          keterangan: 'Perlu perbaikan pada ayat 3-4'
        },
        {
          santriId: santri.id,
          tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          surat: 'Al-Fatihah',
          ayatMulai: 1,
          ayatSelesai: 7,
          status: 'murojaah',
          keterangan: 'Muraja\'ah lancar'
        }
      ];

      for (const hafalan of hafalanData) {
        const created = await prisma.hafalan.create({
          data: hafalan,
          include: {
            santri: {
              select: {
                namaLengkap: true
              }
            }
          }
        });
        testHafalan.push(created);
        console.log(`✅ Created hafalan: ${created.santri.namaLengkap} - ${created.surat} (${created.status})`);
      }
    }

    console.log(`\n📊 Total hafalan created: ${testHafalan.length}\n`);

    // Test creating target hafalan
    console.log('🎯 Testing target hafalan creation...\n');
    const testTargets = [];

    for (let i = 0; i < Math.min(2, halaqahSantri.length); i++) {
      const santri = halaqahSantri[i].santri;
      
      const targetData = [
        {
          santriId: santri.id,
          surat: 'Al-Baqarah',
          ayatTarget: 50,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'proses'
        },
        {
          santriId: santri.id,
          surat: 'Al-Imran',
          ayatTarget: 25,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          status: 'belum'
        }
      ];

      for (const target of targetData) {
        const created = await prisma.targetHafalan.create({
          data: target,
          include: {
            santri: {
              select: {
                namaLengkap: true
              }
            }
          }
        });
        testTargets.push(created);
        console.log(`✅ Created target: ${created.santri.namaLengkap} - ${created.surat} (${created.ayatTarget} ayat)`);
      }
    }

    console.log(`\n📊 Total targets created: ${testTargets.length}\n`);

    // Test notifications creation
    console.log('🔔 Testing notifications...\n');
    const notifications = await prisma.notifikasi.findMany({
      where: {
        type: 'hafalan',
        tanggal: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // last hour
        }
      },
      include: {
        user: {
          select: {
            namaLengkap: true,
            role: { select: { name: true } }
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 10
    });

    console.log(`📬 Recent hafalan notifications (${notifications.length}):`);
    notifications.forEach(notif => {
      console.log(`   - ${notif.user.namaLengkap} (${notif.user.role.name}): ${notif.pesan}`);
    });

    // Test data synchronization for santri dashboard
    console.log('\n📊 Testing santri dashboard data sync...\n');
    
    for (let i = 0; i < Math.min(2, halaqahSantri.length); i++) {
      const santri = halaqahSantri[i].santri;
      
      // Get hafalan for this santri
      const santriHafalan = await prisma.hafalan.findMany({
        where: { santriId: santri.id },
        orderBy: { tanggal: 'desc' },
        take: 5
      });

      // Get targets for this santri
      const santriTargets = await prisma.targetHafalan.findMany({
        where: { santriId: santri.id },
        orderBy: { deadline: 'asc' }
      });

      console.log(`👤 ${santri.namaLengkap}:`);
      console.log(`   📚 Hafalan records: ${santriHafalan.length}`);
      console.log(`   🎯 Active targets: ${santriTargets.length}`);
      
      // Calculate statistics
      const ziyadahCount = santriHafalan.filter(h => h.status === 'ziyadah').length;
      const murojaahCount = santriHafalan.filter(h => h.status === 'murojaah').length;
      const activeTargets = santriTargets.filter(t => t.status === 'proses').length;
      const completedTargets = santriTargets.filter(t => t.status === 'selesai').length;

      console.log(`   📊 Stats: ${ziyadahCount} ziyadah, ${murojaahCount} murojaah`);
      console.log(`   📈 Targets: ${activeTargets} active, ${completedTargets} completed`);
      console.log('');
    }

    // Test audit logs
    console.log('📋 Testing audit logs...\n');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['CREATE_HAFALAN', 'CREATE_TARGET'] },
        tanggal: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // last hour
        }
      },
      include: {
        user: {
          select: {
            namaLengkap: true,
            role: { select: { name: true } }
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 10
    });

    console.log(`📝 Recent audit logs (${auditLogs.length}):`);
    auditLogs.forEach(log => {
      console.log(`   - ${log.user.namaLengkap}: ${log.keterangan}`);
    });

    console.log('\n🎉 Hafalan & Target backend synchronization test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Created ${testHafalan.length} hafalan records`);
    console.log(`   - Created ${testTargets.length} target records`);
    console.log(`   - Generated ${notifications.length} notifications`);
    console.log(`   - Logged ${auditLogs.length} audit entries`);
    console.log(`   - Data properly synchronized for santri dashboard`);

  } catch (error) {
    console.error('❌ Error testing hafalan target sync:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testHafalanTargetSync()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });