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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });