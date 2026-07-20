const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupRoleNames() {
  try {
    console.log('🧹 Cleaning up role names to standardized format...\n');

    const roleMigrations = [
      { from: 'superadmin', to: 'super_admin' },
      { from: 'super-admin', to: 'super_admin' },
      { from: 'orang_tua', to: 'ortu' },
      { from: 'orang tua', to: 'ortu' },
    ];

    for (const { from, to } of roleMigrations) {
      const oldRole = await prisma.role.findUnique({
        where: { name: from },
        include: { _count: { select: { users: true } } },
      });

      if (!oldRole) {
        console.log(`✅ Role "${from}" not found - already clean`);
        continue;
      }

      const existingTarget = await prisma.role.findUnique({
        where: { name: to },
      });

      if (existingTarget) {
        if (oldRole.id !== existingTarget.id) {
          if (oldRole._count.users > 0) {
            console.log(`📦 Migrating ${oldRole._count.users} users from "${from}" to "${to}"...`);
            await prisma.user.updateMany({
              where: { roleId: oldRole.id },
              data: { roleId: existingTarget.id },
            });
            console.log(`✅ Users migrated`);
          }
          await prisma.role.delete({ where: { id: oldRole.id } });
          console.log(`🗑️  Deleted old role "${from}" (ID: ${oldRole.id})\n`);
        } else {
          console.log(`✅ Role "${from}" and "${to}" are the same row - skipping\n`);
        }
      } else {
        console.log(`🔄 Renaming "${from}" to "${to}" (ID: ${oldRole.id})...`);
        await prisma.role.update({
          where: { id: oldRole.id },
          data: { name: to },
        });
        console.log(`✅ Renamed successfully\n`);
      }
    }

    console.log('📋 Final roles in database:');
    const allRoles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    });
    for (const role of allRoles) {
      console.log(`  - "${role.name}" (ID: ${role.id}) - ${role._count.users} users`);
    }

    console.log('\n✅ Role cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRoleNames();
