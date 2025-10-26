const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateOrtuRole() {
  try {
    console.log('🧹 Cleaning up duplicate ortu roles...');
    
    // Find the role "orang tua" that has 0 users
    const roleToDelete = await prisma.role.findFirst({
      where: {
        name: 'orang tua'
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!roleToDelete) {
      console.log('✅ No "orang tua" role found to delete');
      return;
    }

    if (roleToDelete._count.users > 0) {
      console.log(`❌ Cannot delete role "${roleToDelete.name}" - it has ${roleToDelete._count.users} users`);
      return;
    }

    // Delete the unused role
    await prisma.role.delete({
      where: {
        id: roleToDelete.id
      }
    });

    console.log(`✅ Successfully deleted role: ID ${roleToDelete.id} - "${roleToDelete.name}"`);
    
    // Verify remaining ortu role
    const remainingOrtuRole = await prisma.role.findFirst({
      where: {
        name: 'ortu'
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (remainingOrtuRole) {
      console.log(`✅ Remaining ortu role: ID ${remainingOrtuRole.id} - "${remainingOrtuRole.name}" with ${remainingOrtuRole._count.users} users`);
    }

  } catch (error) {
    console.error('❌ Error cleaning up roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateOrtuRole();