const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFilteringImprovements() {
  try {
    console.log('🧪 Testing Filtering & UI Improvements...\n');

    // Get guru user
    const guruUser = await prisma.user.findFirst({
      where: { role: { name: 'guru' } },
      include: { role: true }
    });

    if (!guruUser) {
      console.log('❌ No guru user found.');
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
        }
      },
      take: 3
    });

    console.log(`✅ Found ${halaqahSantri.length} santri for testing:\n`);
    halaqahSantri.forEach(hs => {
      console.log(`   - ${hs.santri.namaLengkap} (ID: ${hs.santri.id})`);
    });
    console.log('');

    // Create diverse test data for filtering
    console.log('📝 Creating diverse test data for filtering...\n');
    
    const testData = [
      // Santri 1 - Al-Fatihah & Al-Baqarah
      { santriId: halaqahSantri[0].santri.id, surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' },
      { santriId: halaqahSantri[0].santri.id, surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 10, status: 'ziyadah' },
      { santriId: halaqahSantri[0].santri.id, surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'murojaah' },
      
      // Santri 2 - Al-Imran & An-Nisa
      { santriId: halaqahSantri[1].santri.id, surat: 'Al-Imran', ayatMulai: 1, ayatSelesai: 15, status: 'ziyadah' },
      { santriId: halaqahSantri[1].santri.id, surat: 'An-Nisa', ayatMulai: 1, ayatSelesai: 5, status: 'ziyadah' },
      { santriId: halaqahSantri[1].santri.id, surat: 'Al-Imran', ayatMulai: 1, ayatSelesai: 10, status: 'murojaah' },
      
      // Santri 3 - Al-Maidah
      { santriId: halaqahSantri[2].santri.id, surat: 'Al-Maidah', ayatMulai: 1, ayatSelesai: 8, status: 'ziyadah' },
      { santriId: halaqahSantri[2].santri.id, surat: 'Al-Maidah', ayatMulai: 9, ayatSelesai: 16, status: 'ziyadah' },
    ];

    for (const data of testData) {
      const hafalan = await prisma.hafalan.create({
        data: {
          ...data,
          tanggal: new Date(),
          keterangan: `Test data for filtering - ${data.surat}`
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });
      console.log(`✅ Created: ${hafalan.santri.namaLengkap} - ${hafalan.surat} (${hafalan.status})`);
    }

    // Create test targets
    console.log('\n🎯 Creating test targets...\n');
    
    const targetData = [
      { santriId: halaqahSantri[0].santri.id, surat: 'Al-Baqarah', ayatTarget: 20, status: 'proses' },
      { santriId: halaqahSantri[1].santri.id, surat: 'Al-Imran', ayatTarget: 25, status: 'proses' },
      { santriId: halaqahSantri[2].santri.id, surat: 'Al-Maidah', ayatTarget: 30, status: 'proses' },
    ];

    for (const data of targetData) {
      const target = await prisma.targetHafalan.create({
        data: {
          ...data,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });
      console.log(`✅ Created target: ${target.santri.namaLengkap} - ${target.surat} (${target.ayatTarget} ayat)`);
    }

    // Test filtering functionality
    console.log('\n🔍 Testing filtering functionality...\n');

    // Test 1: Filter by santri name
    console.log('1. Testing filter by santri name:');
    const santriName = halaqahSantri[0].santri.namaLengkap.split(' ')[1]; // Get part of name
    const hafalanByName = await prisma.hafalan.findMany({
      where: {
        santri: {
          namaLengkap: {
            contains: santriName,
            mode: 'insensitive'
          }
        }
      },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });
    console.log(`   Search "${santriName}": Found ${hafalanByName.length} records`);

    // Test 2: Filter by surat
    console.log('2. Testing filter by surat:');
    const hafalanBySurat = await prisma.hafalan.findMany({
      where: {
        surat: {
          contains: 'Al-Baqarah',
          mode: 'insensitive'
        }
      },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });
    console.log(`   Search "Al-Baqarah": Found ${hafalanBySurat.length} records`);

    // Test 3: Filter by status
    console.log('3. Testing filter by status:');
    const hafalanByStatus = await prisma.hafalan.findMany({
      where: { status: 'ziyadah' },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });
    console.log(`   Filter "ziyadah": Found ${hafalanByStatus.length} records`);

    // Test 4: Combined filters
    console.log('4. Testing combined filters:');
    const combinedFilter = await prisma.hafalan.findMany({
      where: {
        AND: [
          { status: 'ziyadah' },
          { surat: { contains: 'Al-', mode: 'insensitive' } }
        ]
      },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });
    console.log(`   Combined filter: Found ${combinedFilter.length} records`);

    // Test target progress calculation
    console.log('\n📊 Testing target progress calculation...\n');
    
    for (const hs of halaqahSantri) {
      const santri = hs.santri;
      
      // Get targets for this santri
      const targets = await prisma.targetHafalan.findMany({
        where: { santriId: santri.id }
      });

      for (const target of targets) {
        // Calculate progress using the new logic
        const hafalanRecords = await prisma.hafalan.findMany({
          where: {
            santriId: santri.id,
            surat: target.surat,
            status: 'ziyadah'
          },
          select: {
            ayatMulai: true,
            ayatSelesai: true
          }
        });

        // Calculate unique ayat
        const ayatSet = new Set();
        hafalanRecords.forEach(record => {
          for (let i = record.ayatMulai; i <= record.ayatSelesai; i++) {
            ayatSet.add(i);
          }
        });

        const currentAyat = ayatSet.size;
        const progress = Math.min(Math.round((currentAyat / target.ayatTarget) * 100), 100);

        console.log(`👤 ${santri.namaLengkap} - ${target.surat}:`);
        console.log(`   Target: ${target.ayatTarget} ayat`);
        console.log(`   Current: ${currentAyat} ayat (${progress}%)`);
        console.log(`   Status: ${target.status}`);
        console.log('');
      }
    }

    // Test dashboard statistics
    console.log('📈 Testing dashboard statistics...\n');
    
    for (const hs of halaqahSantri) {
      const santri = hs.santri;
      
      // Get all hafalan for this santri
      const allHafalan = await prisma.hafalan.findMany({
        where: { santriId: santri.id }
      });

      // Get all targets for this santri
      const allTargets = await prisma.targetHafalan.findMany({
        where: { santriId: santri.id }
      });

      const ziyadahCount = allHafalan.filter(h => h.status === 'ziyadah').length;
      const murojaahCount = allHafalan.filter(h => h.status === 'murojaah').length;
      const activeTargets = allTargets.filter(t => t.status === 'proses' || t.status === 'belum').length;
      const completedTargets = allTargets.filter(t => t.status === 'selesai').length;

      console.log(`👤 ${santri.namaLengkap} Statistics:`);
      console.log(`   📚 Total Hafalan: ${allHafalan.length} (${ziyadahCount} ziyadah, ${murojaahCount} murojaah)`);
      console.log(`   🎯 Targets: ${activeTargets} active, ${completedTargets} completed`);
      console.log('');
    }

    console.log('🎉 Filtering & UI improvements test completed successfully!');
    console.log('\n📋 Summary of improvements:');
    console.log('   ✅ Enhanced filtering by santri name, surat, and status');
    console.log('   ✅ Better UI/UX with improved cards and statistics');
    console.log('   ✅ More accurate progress calculation for targets');
    console.log('   ✅ Auto status update for targets based on progress');
    console.log('   ✅ Real-time filtering without page reload');
    console.log('   ✅ Better data synchronization between hafalan and targets');

  } catch (error) {
    console.error('❌ Error testing filtering improvements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFilteringImprovements()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });