const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLoginLogic() {
  try {
    console.log('🧪 Testing login logic for passcode: 26122008');

    // Simulate the same logic as in the login API
    const passCode = '26122008';

    // Find user by passCode (same as in login API)
    const user = await prisma.user.findFirst({
      where: { passCode: passCode },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      console.log('❌ Login would fail: Passcode not found');
      return;
    }

    console.log('✅ Login would succeed!');
    console.log('- User ID:', user.id);
    console.log('- Name:', user.namaLengkap);
    console.log('- Username:', user.username);
    console.log('- PassCode:', user.passCode);
    console.log('- Role:', user.role.name);
    console.log('- Email:', user.email);

    // Test the JWT creation logic (without actually creating JWT)
    const tokenPayload = {
      id: user.id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      role: user.role.name,
      foto: user.foto
    };

    console.log('\n🔑 JWT Payload would be:');
    console.log(JSON.stringify(tokenPayload, null, 2));

    // Determine dashboard redirect
    const dashboardMap = {
      'super_admin': '/super-admin/dashboard',
      'admin': '/admin/dashboard',
      'guru': '/guru/dashboard',
      'santri': '/santri/dashboard',
      'ortu': '/ortu/dashboard',
      'yayasan': '/yayasan/dashboard'
    };

    const dashboardUrl = dashboardMap[user.role.name] || '/dashboard';
    console.log('\n🎯 Would redirect to:', dashboardUrl);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginLogic();