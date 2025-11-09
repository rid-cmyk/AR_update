const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrtuRole() {
  try {
    console.log('🔍 Checking ortu role configuration...\n');

    // Check all roles
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    console.log('📋 All roles in database:');
    roles.forEach(role => {
      console.log(`  - ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
    });

    // Check for ortu-related roles
    const ortuRoles = roles.filter(r => 
      r.name.toLowerCase().includes('ortu') || 
      r.name.toLowerCase().includes('orang')
    );

    console.log('\n👨‍👩‍👧 Ortu-related roles:');
    if (ortuRoles.length === 0) {
      console.log('  ❌ No ortu role found!');
    } else {
      ortuRoles.forEach(role => {
        console.log(`  - ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
      });
    }

    // Check users with ortu role
    const ortuUsers = await prisma.user.findMany({
      where: {
        role: {
          OR: [
            { name: 'ortu' },
            { name: 'orang_tua' }
          ]
        }
      },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        passCode: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('\n👤 Users with ortu role:');
    if (ortuUsers.length === 0) {
      console.log('  ❌ No ortu users found!');
    } else {
      ortuUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Name: ${user.namaLengkap}`);
        console.log(`    Role: ${user.role.name}, PassCode: ${user.passCode || 'Not set'}`);
      });
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrtuRole();
