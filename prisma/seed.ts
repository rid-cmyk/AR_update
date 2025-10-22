import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles first
  const roles = [
    { name: 'super-admin' },
    { name: 'admin' },
    { name: 'guru' },
    { name: 'santri' },
    { name: 'ortu' },
    { name: 'yayasan' }
  ];

  console.log('📝 Creating roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`✅ Role "${role.name}" created/updated`);
  }

  // Get super-admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super-admin' }
  });

  if (!superAdminRole) {
    throw new Error('Super-admin role not found');
  }

  // Hash password for super-admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create super-admin user
  console.log('👤 Creating super-admin user...');
  const superAdmin = await prisma.user.upsert({
    where: { username: 'super-admin' },
    update: {
      password: hashedPassword,
      namaLengkap: 'super-admin ridho',
      passCode: '26122008',
      roleId: superAdminRole.id,
    },
    create: {
      username: 'super-admin',
      password: hashedPassword,
      namaLengkap: 'super-admin ridho',
      passCode: '26122008',
      roleId: superAdminRole.id,
      alamat: 'Jakarta',
      noTlp: '081234567890',
    },
  });

  console.log('✅ Super-admin user created/updated:', {
    id: superAdmin.id,
    username: superAdmin.username,
    namaLengkap: superAdmin.namaLengkap,
    passCode: superAdmin.passCode,
    role: 'super-admin'
  });

  // Create admin role user as well
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  });

  if (adminRole) {
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    
    console.log('👤 Creating admin user...');
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        password: adminHashedPassword,
        namaLengkap: 'Administrator',
        roleId: adminRole.id,
      },
      create: {
        username: 'admin',
        password: adminHashedPassword,
        namaLengkap: 'Administrator',
        roleId: adminRole.id,
        alamat: 'Jakarta',
        noTlp: '081234567891',
      },
    });

    console.log('✅ Admin user created/updated:', {
      id: admin.id,
      username: admin.username,
      namaLengkap: admin.namaLengkap,
      role: 'admin'
    });
  }

  // Create sample guru
  const guruRole = await prisma.role.findUnique({
    where: { name: 'guru' }
  });

  if (guruRole) {
    const guruHashedPassword = await bcrypt.hash('guru123', 10);
    
    console.log('👤 Creating sample guru...');
    const guru = await prisma.user.upsert({
      where: { username: 'guru1' },
      update: {
        password: guruHashedPassword,
        namaLengkap: 'Ustadz Ahmad',
        roleId: guruRole.id,
      },
      create: {
        username: 'guru1',
        password: guruHashedPassword,
        namaLengkap: 'Ustadz Ahmad',
        roleId: guruRole.id,
        alamat: 'Jakarta',
        noTlp: '081234567892',
      },
    });

    console.log('✅ Sample guru created/updated:', {
      id: guru.id,
      username: guru.username,
      namaLengkap: guru.namaLengkap,
      role: 'guru'
    });
  }

  // Create sample santri
  const santriRole = await prisma.role.findUnique({
    where: { name: 'santri' }
  });

  if (santriRole) {
    const santriHashedPassword = await bcrypt.hash('santri123', 10);
    
    console.log('👤 Creating sample santri...');
    for (let i = 1; i <= 10; i++) {
      const santri = await prisma.user.upsert({
        where: { username: `santri${i}` },
        update: {
          password: santriHashedPassword,
          namaLengkap: `Santri ${i}`,
          roleId: santriRole.id,
        },
        create: {
          username: `santri${i}`,
          password: santriHashedPassword,
          namaLengkap: `Santri ${i}`,
          roleId: santriRole.id,
          alamat: 'Jakarta',
          noTlp: `08123456789${i}`,
        },
      });

      console.log(`✅ Santri ${i} created/updated`);
    }
  }

  // Create sample pengumuman
  console.log('📢 Creating sample pengumuman...');
  const samplePengumuman = [
    {
      judul: 'Selamat Datang di Sistem Tahfidz',
      isi: 'Selamat datang di sistem manajemen tahfidz. Sistem ini akan membantu Anda dalam mengelola hafalan, target, dan progress belajar Al-Quran.',
      targetAudience: 'semua' as any,
      createdBy: superAdmin.id
    },
    {
      judul: 'Jadwal Halaqah Baru',
      isi: 'Jadwal halaqah telah diperbarui. Silakan cek jadwal terbaru di menu jadwal.',
      targetAudience: 'santri' as any,
      createdBy: superAdmin.id
    },
    {
      judul: 'Panduan untuk Guru',
      isi: 'Panduan lengkap untuk guru dalam menggunakan sistem ini telah tersedia. Silakan pelajari fitur-fitur yang ada.',
      targetAudience: 'guru' as any,
      createdBy: superAdmin.id
    }
  ];

  for (const pengumuman of samplePengumuman) {
    await prisma.pengumuman.create({
      data: pengumuman
    });
  }

  console.log('✅ Sample pengumuman created');

  // Create sample hafalan data
  console.log('📖 Creating sample hafalan data...');
  const santriUsers = await prisma.user.findMany({
    where: { role: { name: 'santri' } },
    take: 3
  });

  for (const santri of santriUsers) {
    // Create some hafalan records
    const hafalanData = [
      {
        tanggal: new Date('2024-01-07'),
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        status: 'ziyadah',
        keterangan: 'Hafalan lancar',
        santriId: santri.id
      },
      {
        tanggal: new Date('2024-01-06'),
        surat: 'Al-Baqarah',
        ayatMulai: 1,
        ayatSelesai: 5,
        status: 'ziyadah',
        keterangan: 'Perlu perbaikan tajwid',
        santriId: santri.id
      },
      {
        tanggal: new Date('2024-01-05'),
        surat: 'Al-Fatihah',
        ayatMulai: 1,
        ayatSelesai: 7,
        status: 'murojaah',
        keterangan: 'Muraja\'ah lancar',
        santriId: santri.id
      }
    ];

    for (const hafalan of hafalanData) {
      await prisma.hafalan.create({
        data: hafalan
      });
    }

    // Create target hafalan
    await prisma.targetHafalan.create({
      data: {
        surat: 'Al-Baqarah',
        ayatTarget: 50,
        deadline: new Date('2024-02-01'),
        status: 'proses',
        santriId: santri.id
      }
    });
  }

  console.log('✅ Sample hafalan and target data created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Super-admin: username="super-admin", password="admin123", passcode="26122008"');
  console.log('Admin: username="admin", password="admin123"');
  console.log('Guru: username="guru1", password="guru123"');
  console.log('Santri: username="santri1-santri10", password="santri123"');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });