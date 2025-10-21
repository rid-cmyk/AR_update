const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    { name: 'super-admin' },
    { name: 'admin' },
    { name: 'guru' },
    { name: 'santri' },
    { name: 'orang_tua' },
    { name: 'yayasan' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Roles created');

  // Get roles
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super-admin' },
  });

  const yayasanRole = await prisma.role.findUnique({
    where: { name: 'yayasan' },
  });

  if (!superAdminRole) {
    throw new Error('Super-admin role not found');
  }

  if (!yayasanRole) {
    throw new Error('Yayasan role not found');
  }

  // Create super-admin user
  const hashedPassword = await bcrypt.hash('26122008', 10);

  await prisma.user.upsert({
    where: { username: 'ridho_admin_super' },
    update: {
      password: hashedPassword,
      passCode: '26122008',
    },
    create: {
      username: 'ridho_admin_super',
      password: hashedPassword,
      namaLengkap: 'Ridho Admin Super',
      passCode: '26122008',
      roleId: superAdminRole.id,
    },
  });

  console.log('Super-admin user created with passcode: 26122008');

  // Create yayasan user
  await prisma.user.upsert({
    where: { username: 'yayasan1' },
    update: {
      passCode: 'yayasan1',
    },
    create: {
      username: 'yayasan1',
      password: hashedPassword, // same password for simplicity
      namaLengkap: 'Yayasan User',
      passCode: 'yayasan1',
      roleId: yayasanRole.id,
    },
  });

  console.log('Yayasan user created with passcode: yayasan1');

  // Create orang tua user
  const orangTuaRole = await prisma.role.findUnique({
    where: { name: 'orang_tua' },
  });

  if (!orangTuaRole) {
    throw new Error('Orang tua role not found');
  }

  await prisma.user.upsert({
    where: { username: 'ortu1' },
    update: {
      passCode: 'ortu1',
    },
    create: {
      username: 'ortu1',
      password: hashedPassword, // same password for simplicity
      namaLengkap: 'Orang Tua User',
      passCode: 'ortu1',
      roleId: orangTuaRole.id,
    },
  });

  console.log('Orang tua user created with passcode: ortu1');

  // Create additional ortu and yayasan users for testing
  const ortuRole = await prisma.role.findUnique({
    where: { name: 'orang_tua' },
  });

  const yayasanRoleTest = await prisma.role.findUnique({
    where: { name: 'yayasan' },
  });

  if (!ortuRole || !yayasanRole) {
    throw new Error('Required roles not found');
  }

  // Create additional ortu user
  await prisma.user.upsert({
    where: { username: 'ortu_test' },
    update: {
      passCode: 'ortu123',
    },
    create: {
      username: 'ortu_test',
      password: hashedPassword,
      namaLengkap: 'Orang Tua Test',
      passCode: 'ortu123',
      roleId: ortuRole.id,
    },
  });

  // Create additional yayasan user
  await prisma.user.upsert({
    where: { username: 'yayasan_test' },
    update: {
      passCode: 'yayasan123',
    },
    create: {
      username: 'yayasan_test',
      password: hashedPassword,
      namaLengkap: 'Yayasan Test',
      passCode: 'yayasan123',
      roleId: yayasanRole.id,
    },
  });

  console.log('Additional test users created');
  console.log('Ortu Test: ortu_test (passcode: ortu123)');
  console.log('Yayasan Test: yayasan_test (passcode: yayasan123)');

  // Create test users for demonstration
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  const guruRole = await prisma.role.findUnique({
    where: { name: 'guru' },
  });

  const santriRole = await prisma.role.findUnique({
    where: { name: 'santri' },
  });

  if (!adminRole || !guruRole || !santriRole) {
    throw new Error('Required roles not found');
  }

  // Create admin user
  await prisma.user.upsert({
    where: { username: 'admin1' },
    update: {
      passCode: 'admin1',
    },
    create: {
      username: 'admin1',
      password: hashedPassword,
      namaLengkap: 'Admin User',
      passCode: 'admin1',
      roleId: adminRole.id,
    },
  });

  // Create guru "Nur Fathoni"
  const guruNurFathoni = await prisma.user.upsert({
    where: { username: 'guru_nur_fathoni' },
    update: {
      passCode: 'guru123',
    },
    create: {
      username: 'guru_nur_fathoni',
      password: hashedPassword,
      namaLengkap: 'Nur Fathoni',
      passCode: 'guru123',
      roleId: guruRole.id,
    },
  });

  // Create santri users
  const santriUsers = [];
  for (let i = 1; i <= 6; i++) {
    const santri = await prisma.user.upsert({
      where: { username: `santri${i}` },
      update: {
        passCode: `santri${i}`,
      },
      create: {
        username: `santri${i}`,
        password: hashedPassword,
        namaLengkap: `Santri ${i}`,
        passCode: `santri${i}`,
        roleId: santriRole.id,
      },
    });
    santriUsers.push(santri);
  }

  console.log('Test users created');

  // Create halaqah for Nur Fathoni
  const halaqahNurFathoni = await prisma.halaqah.upsert({
    where: { id: 1 },
    update: {
      namaHalaqah: 'Halaqah Nur Fathoni',
      guruId: guruNurFathoni.id,
    },
    create: {
      namaHalaqah: 'Halaqah Nur Fathoni',
      guruId: guruNurFathoni.id,
    },
  });

  console.log('Halaqah created for Nur Fathoni');

  // Assign santri to halaqah
  const tahunAkademik = new Date().getFullYear().toString();
  const semester = new Date().getMonth() < 6 ? 'S1' : 'S2';

  for (const santri of santriUsers) {
    await prisma.halaqahSantri.create({
      data: {
        halaqahId: halaqahNurFathoni.id,
        santriId: santri.id,
        tahunAkademik,
        semester: semester,
      },
    });
  }

  console.log('Santri assigned to halaqah');

  // Create jadwal for the halaqah
  const jadwalData = [
    { hari: 'Senin', jamMulai: new Date('2024-01-01T08:00:00'), jamSelesai: new Date('2024-01-01T10:00:00') },
    { hari: 'Rabu', jamMulai: new Date('2024-01-01T14:00:00'), jamSelesai: new Date('2024-01-01T16:00:00') },
    { hari: 'Jumat', jamMulai: new Date('2024-01-01T19:00:00'), jamSelesai: new Date('2024-01-01T21:00:00') },
  ];

  for (const jadwal of jadwalData) {
    await prisma.jadwal.create({
      data: {
        halaqahId: halaqahNurFathoni.id,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
      },
    });
  }

  console.log('Jadwal created for halaqah');
  console.log('Database seeded successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('Admin: admin1 (passcode: admin1)');
  console.log('Guru Nur Fathoni: guru_nur_fathoni (passcode: guru123)');
  console.log('Santri: santri1-santri6 (passcodes: santri1-santri6)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });