const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleHalaqah() {
  console.log('Creating sample halaqah "Nur Fatoni"...');

  try {
    // Get existing users
    const guru = await prisma.user.findMany({
      where: { role: { name: 'guru' } },
      select: { id: true, namaLengkap: true }
    });

    const santri = await prisma.user.findMany({
      where: { role: { name: 'santri' } },
      select: { id: true, namaLengkap: true }
    });

    console.log(`Found ${guru.length} guru and ${santri.length} santri`);

    if (guru.length === 0 || santri.length === 0) {
      console.log('Not enough users. Please run seed first.');
      return;
    }

    // Create halaqah "Nur Fatoni"
    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah: 'Nur Fatoni',
        guruId: guru[0].id // Assign first guru
      }
    });

    console.log('Created halaqah:', halaqah);

    // Assign santri to halaqah
    const tahunAkademik = new Date().getFullYear().toString();
    const semester = new Date().getMonth() < 6 ? 'S1' : 'S2';

    const santriAssignments = santri.slice(0, 5).map(s => ({ // Assign first 5 santri
      halaqahId: halaqah.id,
      santriId: s.id,
      tahunAkademik,
      semester: semester
    }));

    await prisma.halaqahSantri.createMany({
      data: santriAssignments
    });

    console.log(`Assigned ${santriAssignments.length} santri to halaqah`);

    // Create sample hafalan data
    const sampleHafalan = [
      {
        santriId: santri[0].id,
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        tanggal: new Date(),
        status: 'ziyadah'
      },
      {
        santriId: santri[1].id,
        surat: 'Al-Baqarah',
        ayatMulai: 1,
        ayatSelesai: 5,
        tanggal: new Date(),
        status: 'ziyadah'
      }
    ];

    for (const hafalan of sampleHafalan) {
      await prisma.hafalan.create({
        data: hafalan
      });
    }

    console.log('Created sample hafalan data');

    // Create sample target data
    const sampleTargets = [
      {
        santriId: santri[0].id,
        surat: 'Al-Baqarah',
        ayatTarget: 50,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'belum'
      },
      {
        santriId: santri[1].id,
        surat: 'Ali Imran',
        ayatTarget: 30,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'belum'
      }
    ];

    for (const target of sampleTargets) {
      await prisma.targetHafalan.create({
        data: target
      });
    }

    console.log('Created sample target data');
    console.log('Sample halaqah "Nur Fatoni" created successfully!');

  } catch (error) {
    console.error('Error creating sample halaqah:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleHalaqah();