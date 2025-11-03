const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...');

    // Create roles first if they don't exist
    const roles = [
      { name: 'super_admin' },
      { name: 'admin' },
      { name: 'guru' },
      { name: 'santri' },
      { name: 'ortu' },
      { name: 'yayasan' }
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role
      });
    }

    // Get role IDs
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const guruRole = await prisma.role.findUnique({ where: { name: 'guru' } });
    const santriRole = await prisma.role.findUnique({ where: { name: 'santri' } });
    const ortuRole = await prisma.role.findUnique({ where: { name: 'ortu' } });
    const yayasanRole = await prisma.role.findUnique({ where: { name: 'yayasan' } });

    // Create test users
    const testUsers = [
      {
        username: 'super_admin',
        password: 'super_admin',
        passCode: 'super_admin',
        namaLengkap: 'Super Administrator',
        email: 'superadmin@arhafalan.com',
        noTlp: '081234567890',
        roleId: superAdminRole.id
      },
      {
        username: 'admin123',
        password: 'admin123',
        passCode: 'admin123',
        namaLengkap: 'Admin Sistem',
        email: 'admin@arhafalan.com',
        noTlp: '081234567891',
        roleId: adminRole.id
      },
      {
        username: 'guru123',
        password: 'guru123',
        passCode: 'guru123',
        namaLengkap: 'Ustadz Ahmad',
        email: 'guru@arhafalan.com',
        noTlp: '081234567892',
        roleId: guruRole.id
      },
      {
        username: 'santri123',
        password: 'santri123',
        passCode: 'santri123',
        namaLengkap: 'Muhammad Ali',
        email: 'santri@arhafalan.com',
        noTlp: '081234567893',
        roleId: santriRole.id
      },
      {
        username: 'ortu123',
        password: 'ortu123',
        passCode: 'ortu123',
        namaLengkap: 'Bapak Santri',
        email: 'ortu@arhafalan.com',
        noTlp: '081234567894',
        roleId: ortuRole.id
      },
      {
        username: 'yayasan123',
        password: 'yayasan123',
        passCode: 'yayasan123',
        namaLengkap: 'Ketua Yayasan',
        email: 'yayasan@arhafalan.com',
        noTlp: '081234567895',
        roleId: yayasanRole.id
      }
    ];

    for (const user of testUsers) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: {
          password: user.password,
          passCode: user.passCode,
          namaLengkap: user.namaLengkap,
          email: user.email,
          noTlp: user.noTlp
        },
        create: user
      });
      console.log(`✅ Created/Updated user: ${user.namaLengkap} (${user.passCode})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Super Admin: super_admin');
    console.log('Admin: admin123');
    console.log('Guru: guru123');
    console.log('Santri: santri123');
    console.log('Orang Tua: ortu123');
    console.log('Yayasan: yayasan123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();