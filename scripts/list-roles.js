const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listRoles() {
  const roles = await prisma.role.findMany();
  console.log('All roles:', JSON.stringify(roles, null, 2));
  await prisma.$disconnect();
}

listRoles();
