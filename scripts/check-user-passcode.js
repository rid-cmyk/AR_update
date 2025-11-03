const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPasscode() {
  try {
    console.log('🔍 Checking user with passcode: 26122008');

    // Check if user exists with this passcode
    const user = await prisma.user.findFirst({
      where: { passCode: '26122008' },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    if (user) {
      console.log('✅ User found:');
      console.log('- ID:', user.id);
      console.log('- Username:', user.username);
      console.log('- Nama Lengkap:', user.namaLengkap);
      console.log('- PassCode:', user.passCode);
      console.log('- Password:', user.password);
      console.log('- Role:', user.role.name);
      console.log('- Email:', user.email);
      console.log('- No Telp:', user.noTlp);
    } else {
      console.log('❌ User with passcode 26122008 NOT FOUND');
      
      // Let's check all users to see what passcodes exist
      console.log('\n📋 All users in database:');
      const allUsers = await prisma.user.findMany({
        include: {
          role: {
            select: { name: true }
          }
        }
      });

      allUsers.forEach(user => {
        console.log(`- ${user.namaLengkap} | PassCode: ${user.passCode} | Role: ${user.role.name}`);
      });
    }

    // Also check if there's a user with similar passcode
    console.log('\n🔍 Checking for similar passcodes...');
    const similarUsers = await prisma.user.findMany({
      where: {
        OR: [
          { passCode: { contains: '26122008' } },
          { username: { contains: '26122008' } },
          { password: { contains: '26122008' } }
        ]
      },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    if (similarUsers.length > 0) {
      console.log('📝 Found similar passcodes:');
      similarUsers.forEach(user => {
        console.log(`- ${user.namaLengkap} | PassCode: ${user.passCode} | Username: ${user.username}`);
      });
    } else {
      console.log('❌ No similar passcodes found');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPasscode();