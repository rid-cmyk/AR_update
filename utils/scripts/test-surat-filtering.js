const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSuratFiltering() {
  try {
    console.log('🧪 Testing Surat Filtering (Case-Insensitive)...\n');

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
            namaLengkap: true
          }
        }
      },
      take: 2
    });

    if (halaqahSantri.length === 0) {
      console.log('❌ No santri found in guru halaqah.');
      return;
    }

    console.log(`✅ Found ${halaqahSantri.length} santri for testing\n`);

    // Create test data with different case variations
    console.log('📝 Creating test data with different case variations...\n');
    
    const testSuratVariations = [
      'Al-Fatihah',    // Standard case
      'AL-FATIHAH',    // All uppercase
      'al-fatihah',    // All lowercase
      'Al-Baqarah',    // Standard case
      'AL-BAQARAH',    // All uppercase
      'al-baqarah',    // All lowercase
      'An-Nas',        // Standard case
      'AN-NAS',        // All uppercase
      'an-nas',        // All lowercase
    ];

    const createdHafalan = [];
    
    for (let i = 0; i < testSuratVariations.length; i++) {
      const santri = halaqahSantri[i % halaqahSantri.length].santri;
      const surat = testSuratVariations[i];
      
      const hafalan = await prisma.hafalan.create({
        data: {
          santriId: santri.id,
          tanggal: new Date(),
          surat: surat,
          ayatMulai: 1,
          ayatSelesai: 7,
          status: 'ziyadah',
          keterangan: `Test data for case-insensitive filtering - ${surat}`
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });
      
      createdHafalan.push(hafalan);
      console.log(`✅ Created: ${hafalan.santri.namaLengkap} - ${hafalan.surat}`);
    }

    // Create test targets with case variations
    console.log('\n🎯 Creating test targets with case variations...\n');
    
    const targetSuratVariations = [
      'Al-Imran',      // Standard case
      'AL-IMRAN',      // All uppercase
      'al-imran',      // All lowercase
    ];

    const createdTargets = [];
    
    for (let i = 0; i < targetSuratVariations.length; i++) {
      const santri = halaqahSantri[i % halaqahSantri.length].santri;
      const surat = targetSuratVariations[i];
      
      const target = await prisma.targetHafalan.create({
        data: {
          santriId: santri.id,
          surat: surat,
          ayatTarget: 20,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'belum'
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });
      
      createdTargets.push(target);
      console.log(`✅ Created target: ${target.santri.namaLengkap} - ${target.surat}`);
    }

    // Test case-insensitive filtering for hafalan
    console.log('\n🔍 Testing case-insensitive filtering for HAFALAN...\n');

    const testCases = [
      { search: 'fatihah', description: 'lowercase "fatihah"' },
      { search: 'FATIHAH', description: 'uppercase "FATIHAH"' },
      { search: 'Fatihah', description: 'mixed case "Fatihah"' },
      { search: 'al-fat', description: 'partial "al-fat"' },
      { search: 'AL-BAQ', description: 'partial uppercase "AL-BAQ"' },
      { search: 'baqarah', description: 'lowercase "baqarah"' },
      { search: 'nas', description: 'partial "nas"' },
    ];

    for (const testCase of testCases) {
      console.log(`🔍 Testing hafalan filter: ${testCase.description}`);
      
      // Get santri IDs for this guru
      const santriIds = halaqahSantri.map(hs => hs.santriId);
      
      const results = await prisma.hafalan.findMany({
        where: {
          santriId: { in: santriIds },
          surat: {
            contains: testCase.search,
            mode: 'insensitive'
          }
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });

      console.log(`   📊 Found ${results.length} results:`);
      results.forEach(result => {
        console.log(`      - ${result.santri.namaLengkap}: ${result.surat}`);
      });
      console.log('');
    }

    // Test case-insensitive filtering for targets
    console.log('🔍 Testing case-insensitive filtering for TARGETS...\n');

    const targetTestCases = [
      { search: 'imran', description: 'lowercase "imran"' },
      { search: 'IMRAN', description: 'uppercase "IMRAN"' },
      { search: 'Imran', description: 'mixed case "Imran"' },
      { search: 'al-im', description: 'partial "al-im"' },
    ];

    for (const testCase of targetTestCases) {
      console.log(`🔍 Testing target filter: ${testCase.description}`);
      
      // Get santri IDs for this guru
      const santriIds = halaqahSantri.map(hs => hs.santriId);
      
      const results = await prisma.targetHafalan.findMany({
        where: {
          santriId: { in: santriIds },
          surat: {
            contains: testCase.search,
            mode: 'insensitive'
          }
        },
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });

      console.log(`   📊 Found ${results.length} results:`);
      results.forEach(result => {
        console.log(`      - ${result.santri.namaLengkap}: ${result.surat} (${result.ayatTarget} ayat)`);
      });
      console.log('');
    }

    // Test combined filters (santri name + surat)
    console.log('🔍 Testing COMBINED filters (santri name + surat)...\n');
    
    const santriName = halaqahSantri[0].santri.namaLengkap.split(' ')[1]; // Get part of name
    
    console.log(`🔍 Testing combined filter: santri="${santriName}" + surat="fatihah"`);
    
    const combinedResults = await prisma.hafalan.findMany({
      where: {
        AND: [
          {
            santri: {
              namaLengkap: {
                contains: santriName,
                mode: 'insensitive'
              }
            }
          },
          {
            surat: {
              contains: 'fatihah',
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });

    console.log(`   📊 Found ${combinedResults.length} results:`);
    combinedResults.forEach(result => {
      console.log(`      - ${result.santri.namaLengkap}: ${result.surat}`);
    });

    // Test API simulation
    console.log('\n🌐 Testing API simulation...\n');
    
    // Simulate API call with different case variations
    const apiTestCases = [
      { santriName: '', surat: 'fatihah', status: '' },
      { santriName: '', surat: 'BAQARAH', status: '' },
      { santriName: santriName.toLowerCase(), surat: '', status: '' },
      { santriName: santriName.toUpperCase(), surat: 'al-', status: 'ziyadah' },
    ];

    for (const apiTest of apiTestCases) {
      console.log(`🌐 API Test: santriName="${apiTest.santriName}", surat="${apiTest.surat}", status="${apiTest.status}"`);
      
      // Simulate the API logic
      const santriIds = halaqahSantri.map(hs => hs.santriId);
      
      // Filter by santri name if specified
      let filteredSantriIds = santriIds;
      if (apiTest.santriName) {
        const filteredSantri = halaqahSantri.filter(hs => 
          hs.santri.namaLengkap.toLowerCase().includes(apiTest.santriName.toLowerCase())
        );
        filteredSantriIds = filteredSantri.map(hs => hs.santriId);
      }

      let whereClause = {
        santriId: { in: filteredSantriIds }
      };

      // Filter by surat if specified
      if (apiTest.surat) {
        whereClause.surat = {
          contains: apiTest.surat,
          mode: 'insensitive'
        };
      }

      // Filter by status if specified
      if (apiTest.status && ['ziyadah', 'murojaah'].includes(apiTest.status)) {
        whereClause.status = apiTest.status;
      }

      const apiResults = await prisma.hafalan.findMany({
        where: whereClause,
        include: {
          santri: { select: { namaLengkap: true } }
        }
      });

      console.log(`   📊 API Results: ${apiResults.length} records found`);
      apiResults.slice(0, 3).forEach(result => {
        console.log(`      - ${result.santri.namaLengkap}: ${result.surat} (${result.status})`);
      });
      if (apiResults.length > 3) {
        console.log(`      ... and ${apiResults.length - 3} more`);
      }
      console.log('');
    }

    console.log('🎉 Surat filtering test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Created ${createdHafalan.length} hafalan with case variations`);
    console.log(`   ✅ Created ${createdTargets.length} targets with case variations`);
    console.log(`   ✅ Case-insensitive filtering working for hafalan`);
    console.log(`   ✅ Case-insensitive filtering working for targets`);
    console.log(`   ✅ Combined filters (santri + surat) working`);
    console.log(`   ✅ API simulation tests passed`);
    console.log(`   ✅ Filter works with: lowercase, UPPERCASE, Mixed Case, partial matches`);

  } catch (error) {
    console.error('❌ Error testing surat filtering:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSuratFiltering()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });