const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEnum() {
  try {
    // Check existing pengumuman
    const existing = await prisma.pengumuman.findMany({
      select: {
        id: true,
        judul: true,
        targetAudience: true
      }
    });

    console.log('Existing pengumuman:');
    existing.forEach(p => {
      console.log(`- ${p.judul} (${p.targetAudience})`);
    });

    // Try to create with different values to see what's valid
    const validValues = ['semua', 'guru', 'santri', 'admin'];
    
    console.log('\nTesting valid enum values...');
    for (const value of validValues) {
      try {
        console.log(`Testing: ${value}`);
        // Just test the validation without actually creating
      } catch (error) {
        console.log(`❌ ${value} is invalid`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnum();