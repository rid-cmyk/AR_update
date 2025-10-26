const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicateOrtuRoles() {
  try {
    console.log('🔍 Checking for duplicate ortu roles...');
    
    // Find all roles that contain 'ortu' or 'orang'
    const ortuRoles = await prisma.role.findMany({
      where: {
        OR: [
          { name: { contains: 'ortu', mode: 'insensitive' } },
          { name: { contains: 'orang', mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    console.log('📋 Found ortu-related roles:');
    ortuRoles.forEach(role => {
      console.log(`- ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
    });

    if (ortuRoles.length > 1) {
      console.log('\n⚠️  Multiple ortu roles detected!');
      console.log('🎯 Recommendation: Keep one role and merge users from others');
      
      // Find the role with most users or the one named exactly 'ortu'
      const preferredRole = ortuRoles.find(r => r.name.toLowerCase() === 'ortu') || 
                           ortuRoles.reduce((prev, current) => 
                             prev._count.users > current._count.users ? prev : current
                           );
      
      console.log(`✅ Recommended to keep: ID ${preferredRole.id} - "${preferredRole.name}"`);
      
      const rolesToDelete = ortuRoles.filter(r => r.id !== preferredRole.id);
      console.log('🗑️  Roles to delete/merge:');
      rolesToDelete.forEach(role => {
        console.log(`- ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
      });
    } else if (ortuRoles.length === 1) {
      console.log('✅ Only one ortu role found - no duplicates!');
    } else {
      console.log('❌ No ortu role found!');
    }

  } catch (error) {
    console.error('❌ Error checking roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicateOrtuRoles();