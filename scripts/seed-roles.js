const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...\n');

    const rolesToCreate = [
      'super_admin',
      'admin',
      'guru',
      'santri',
      'ortu',
      'yayasan'
    ];

    for (const roleName of rolesToCreate) {
      const existing = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (existing) {
        console.log(`✓ Role "${roleName}" already exists (ID: ${existing.id})`);
      } else {
        const created = await prisma.role.create({
          data: { name: roleName }
        });
        console.log(`✅ Created role "${roleName}" (ID: ${created.id})`);
      }
    }

    console.log('\n📋 All roles in database:');
    const allRoles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    allRoles.forEach(role => {
      console.log(`  - ID: ${role.id}, Name: "${role.name}", Users: ${role._count.users}`);
    });

    console.log('\n✅ Roles seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
