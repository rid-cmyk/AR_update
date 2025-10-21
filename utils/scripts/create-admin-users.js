const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUsers() {
  console.log('Creating additional admin users...');

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Create admin02
    await prisma.user.upsert({
      where: { username: 'admin02' },
      update: {
        passCode: 'admin02',
      },
      create: {
        username: 'admin02',
        password: hashedPassword,
        namaLengkap: 'Admin 02',
        passCode: 'admin02',
        roleId: adminRole.id,
      },
    });

    // Get guru role
    const guruRole = await prisma.role.findUnique({
      where: { name: 'guru' },
    });

    if (!guruRole) {
      throw new Error('Guru role not found');
    }

    // Create guru01
    await prisma.user.upsert({
      where: { username: 'guru01' },
      update: {
        passCode: 'guru01',
      },
      create: {
        username: 'guru01',
        password: hashedPassword,
        namaLengkap: 'Guru 01',
        passCode: 'guru01',
        roleId: guruRole.id,
      },
    });

    // Get santri role
    const santriRole = await prisma.role.findUnique({
      where: { name: 'santri' },
    });

    if (!santriRole) {
      throw new Error('Santri role not found');
    }

    // Create santri01
    await prisma.user.upsert({
      where: { username: 'santri01' },
      update: {
        passCode: 'santri01',
      },
      create: {
        username: 'santri01',
        password: hashedPassword,
        namaLengkap: 'Santri 01',
        passCode: 'santri01',
        roleId: santriRole.id,
      },
    });

    // Get ortu role
    const ortuRole = await prisma.role.findUnique({
      where: { name: 'ortu' },
    });

    if (!ortuRole) {
      throw new Error('Ortu role not found');
    }

    // Create ortu01
    await prisma.user.upsert({
      where: { username: 'ortu01' },
      update: {
        passCode: 'ortu01',
      },
      create: {
        username: 'ortu01',
        password: hashedPassword,
        namaLengkap: 'Orang Tua 01',
        passCode: 'ortu01',
        roleId: ortuRole.id,
      },
    });

    // Get yayasan role
    const yayasanRole = await prisma.role.findUnique({
      where: { name: 'yayasan' },
    });

    if (!yayasanRole) {
      throw new Error('Yayasan role not found');
    }

    // Create yayasan01
    await prisma.user.upsert({
      where: { username: 'yayasan01' },
      update: {
        passCode: 'yayasan01',
      },
      create: {
        username: 'yayasan01',
        password: hashedPassword,
        namaLengkap: 'Yayasan 01',
        passCode: 'yayasan01',
        roleId: yayasanRole.id,
      },
    });

    // Create parent-child relationship for ortu01 and santri01
    const ortu01 = await prisma.user.findUnique({
      where: { username: 'ortu01' }
    });

    const santri01 = await prisma.user.findUnique({
      where: { username: 'santri01' }
    });

    if (ortu01 && santri01) {
      await prisma.orangTuaSantri.upsert({
        where: {
          orangTuaId_santriId: {
            orangTuaId: ortu01.id,
            santriId: santri01.id
          }
        },
        update: {},
        create: {
          orangTuaId: ortu01.id,
          santriId: santri01.id
        }
      });
    }

    console.log('Additional users created successfully!');
    console.log('Admin02: admin02 (passcode: admin02)');
    console.log('Guru01: guru01 (passcode: guru01)');
    console.log('Santri01: santri01 (passcode: santri01)');
    console.log('Ortu01: ortu01 (passcode: ortu01) - assigned to Santri01');
    console.log('Yayasan01: yayasan01 (passcode: yayasan01)');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers();