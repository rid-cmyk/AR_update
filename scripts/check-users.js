const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Checking users...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        passCode: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 20
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log(`Found ${users.length} users:\n`);
      users.forEach(user => {
        console.log(`ID: ${user.id} | Username: ${user.username}`);
        console.log(`  Name: ${user.namaLengkap}`);
        console.log(`  PassCode: ${user.passCode || 'Not set'}`);
        console.log(`  RoleId: ${user.roleId} | Role: ${user.role?.name || 'INVALID ROLE!'}`);
        console.log('');
      });
    }

    // Check for users with invalid roleId
    const usersWithInvalidRole = users.filter(u => !u.role);
    if (usersWithInvalidRole.length > 0) {
      console.log(`⚠️  ${usersWithInvalidRole.length} users have invalid roleId!`);
      console.log('These users need their roleId updated.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
