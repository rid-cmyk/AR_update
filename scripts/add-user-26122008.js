const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUser26122008() {
  try {
    console.log('🚀 Adding user with passcode: 26122008');

    // First, get or create roles
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

    // Get santri role (or you can change this to any role you prefer)
    const santriRole = await prisma.role.findUnique({ where: { name: 'santri' } });

    // Create user with passcode 26122008
    const newUser = await prisma.user.upsert({
      where: { username: '26122008' }, // Use passcode as username
      update: {
        passCode: '26122008',
        password: '26122008',
        namaLengkap: 'Test User 26122008',
        email: 'testuser@arhafalan.com',
        noTlp: '081234567899'
      },
      create: {
        username: '26122008',
        password: '26122008',
        passCode: '26122008',
        namaLengkap: 'Test User 26122008',
        email: 'testuser@arhafalan.com',
        noTlp: '081234567899',
        roleId: santriRole.id
      },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    console.log('✅ User created/updated successfully:');
    console.log('- ID:', newUser.id);
    console.log('- Username:', newUser.username);
    console.log('- Nama Lengkap:', newUser.namaLengkap);
    console.log('- PassCode:', newUser.passCode);
    console.log('- Role:', newUser.role.name);
    console.log('- Email:', newUser.email);

    // Also fix users with null passcode
    console.log('\n🔧 Fixing users with null passcode...');
    
    const usersWithNullPasscode = await prisma.user.findMany({
      where: { passCode: null },
      include: { role: true }
    });

    for (const user of usersWithNullPasscode) {
      // Generate passcode based on username or create a simple one
      let newPasscode = user.username;
      if (!newPasscode || newPasscode.length < 3) {
        newPasscode = `${user.role.name}${user.id}`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passCode: newPasscode,
          password: newPasscode // Also update password to match
        }
      });

      console.log(`✅ Fixed user: ${user.namaLengkap} | New PassCode: ${newPasscode}`);
    }

    console.log('\n🎉 All users fixed! You can now login with:');
    console.log('- PassCode: 26122008 (Test User)');
    console.log('- PassCode: super_admin (Super Administrator)');
    console.log('- PassCode: admin123 (Admin Sistem)');
    console.log('- PassCode: guru123 (Ustadz Ahmad)');
    console.log('- PassCode: santri123 (Muhammad Ali)');

  } catch (error) {
    console.error('❌ Error adding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUser26122008();