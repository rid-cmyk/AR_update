const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleData() {
  console.log('Creating sample hafalan and target data...');

  try {
    // Get existing santri IDs
    const santri = await prisma.user.findMany({
      where: { role: { name: 'santri' } },
      select: { id: true, namaLengkap: true }
    });

    console.log(`Found ${santri.length} santri`);

    if (santri.length === 0) {
      console.log('No santri found. Please run seed first to create users.');
      return;
    }

    // Create sample hafalan data for today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sampleHafalan = [
      {
        santriId: santri[0]?.id || 1,
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        tanggal: today,
        status: 'ziyadah'
      },
      {
        santriId: santri[0]?.id || 1,
        surat: 'Al-Baqarah',
        ayatMulai: 1,
        ayatSelesai: 5,
        tanggal: today,
        status: 'ziyadah'
      },
      {
        santriId: santri[1]?.id || 2,
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        tanggal: today,
        status: 'murojaah'
      },
      {
        santriId: santri[1]?.id || 2,
        surat: 'An-Nas',
        ayatMulai: 1,
        ayatSelesai: 6,
        tanggal: yesterday,
        status: 'murojaah'
      }
    ];

    for (const hafalan of sampleHafalan) {
      await prisma.hafalan.upsert({
        where: {
          id: Math.floor(Math.random() * 1000000) // Random ID for upsert
        },
        update: {},
        create: hafalan
      });
    }

    console.log('Sample hafalan data created');

    // Create sample target data
    const sampleTargets = [
      {
        santriId: santri[0]?.id || 1,
        surat: 'Al-Baqarah',
        ayatTarget: 50,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'belum'
      },
      {
        santriId: santri[1]?.id || 2,
        surat: 'Ali Imran',
        ayatTarget: 30,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'belum'
      },
      {
        santriId: santri[2]?.id || 3,
        surat: 'Juz Amma',
        ayatTarget: 564,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'proses'
      }
    ];

    for (const target of sampleTargets) {
      await prisma.targetHafalan.upsert({
        where: {
          id: Math.floor(Math.random() * 1000000) // Random ID for upsert
        },
        update: {},
        create: target
      });
    }

    console.log('Sample target data created');
    console.log('Sample data creation completed!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();