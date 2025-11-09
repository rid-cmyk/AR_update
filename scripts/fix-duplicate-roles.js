const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateRoles() {
  try {
    console.log('🔧 Fixing duplicate roles...\n');

    // Check for super_admin vs super-admin
    const superAdminUnderscore = await prisma.role.findUnique({
      where: { name: 'super_admin' },
      include: { _count: { select: { users: true } } }
    });

    const superAdminDash = await prisma.role.findUnique({
      where: { name: 'super-admin' },
      include: { _count: { select: { users: true } } }
    });

    if (superAdminUnderscore && superAdminDash) {
      console.log('Found duplicate super-admin roles:');
      console.log(`  - "super_admin" (ID: ${superAdminUnderscore.id}) with ${superAdminUnderscore._count.users} users`);
      console.log(`  - "super-admin" (ID: ${superAdminDash.id}) with ${superAdminDash._count.users} users`);

      // Keep the one with users, or the dash version if both have users
      if (superAdminUnderscore._count.users === 0 && superAdminDash._count.users > 0) {
        console.log('\n🗑️  Deleting "super_admin" (no users)...');
        await prisma.role.delete({ where: { id: superAdminUnderscore.id } });
        console.log('✅ Deleted');
      } else if (superAdminDash._count.users === 0 && superAdminUnderscore._count.users > 0) {
        console.log('\n🗑️  Deleting "super-admin" (no users)...');
        await prisma.role.delete({ where: { id: superAdminDash.id } });
        console.log('✅ Deleted');
      } else {
        console.log('\n⚠️  Both roles have users. Keeping "super-admin" and migrating users from "super_admin"...');
        await prisma.user.updateMany({
          where: { roleId: superAdminUnderscore.id },
          data: { roleId: superAdminDash.id }
        });
        await prisma.role.delete({ where: { id: superAdminUnderscore.id } });
        console.log('✅ Migrated and deleted');
      }
    }

    console.log('\n📋 Final roles:');
    const allRoles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } }
    });
    allRoles.forEach(role => {
      console.log(`  - ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateRoles();
