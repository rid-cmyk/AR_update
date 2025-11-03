// Script untuk assign guru ke halaqah
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function assignGuruToHalaqah() {
  console.log('🔧 Assigning Guru to Halaqah...')

  try {
    // Get all guru
    const allGuru = await prisma.user.findMany({
      where: { role: 'GURU' },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      }
    })

    // Get unassigned halaqah
    const unassignedHalaqah = await prisma.halaqah.findMany({
      where: { guruId: null },
      include: {
        santri: true
      }
    })

    console.log(`📊 Found ${allGuru.length} guru(s) and ${unassignedHalaqah.length} unassigned halaqah`)

    if (allGuru.length === 0) {
      console.log('❌ No guru found. Please create guru first.')
      return
    }

    if (unassignedHalaqah.length === 0) {
      console.log('✅ All halaqah are already assigned!')
      return
    }

    // Auto-assign guru to halaqah
    console.log('\n🔄 Auto-assigning guru to halaqah...')

    for (let i = 0; i < unassignedHalaqah.length; i++) {
      const halaqah = unassignedHalaqah[i]
      const guru = allGuru[i % allGuru.length] // Round-robin assignment

      await prisma.halaqah.update({
        where: { id: halaqah.id },
        data: { guruId: guru.id }
      })

      console.log(`✅ Assigned ${halaqah.namaHalaqah} → ${guru.namaLengkap} (${halaqah.santri.length} santri)`)
    }

    console.log('\n🎉 Assignment completed!')

    // Verify assignments
    console.log('\n📊 Verification - Current assignments:')

    const updatedHalaqah = await prisma.halaqah.findMany({
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        },
        santri: true
      }
    })

    updatedHalaqah.forEach(h => {
      console.log(`   ${h.namaHalaqah} → ${h.guru?.namaLengkap || 'UNASSIGNED'} (${h.santri.length} santri)`)
    })

  } catch (error) {
    console.error('❌ Assignment failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the assignment
assignGuruToHalaqah().catch(console.error)