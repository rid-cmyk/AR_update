const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_PASSCODES = [
  { username: 'guru1',   passCode: 'GURU1TEST' },
  { username: 'admin',   passCode: 'ADMIN-TEST' },
  { username: 'santri2', passCode: 'SANTRI2TS' },
  { username: 'santri3', passCode: 'SANTRI3TS' },
  { username: 'ortu2',   passCode: 'ORTU2TEST' },
];

async function setup() {
  console.log('🌱 Setting up test passcodes...');
  for (const entry of TEST_PASSCODES) {
    try {
      await prisma.user.update({
        where: { username: entry.username },
        data: { passCode: entry.passCode }
      });
      console.log(`✅ PassCode set for ${entry.username}`);
    } catch (err) {
      console.log(`⚠️ Could not set passcode for ${entry.username}: ${err.message}`);
    }
  }
  await prisma.$disconnect();
}
setup();
