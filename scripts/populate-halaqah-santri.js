// Script untuk populate HalaqahSantri
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function populateHalaqahSantri() {
  try {
    console.log('🔄 Populating HalaqahSantri data...\n')

    // Get Halaqah Umar
    const halaqahUmar = await prisma.halaqah.findFirst({
      where: { namaHalaqah: 'umar' }
    })

    if (!halaqahUmar) {
      console.log('❌ Halaqah Umar tidak ditemukan')
      return
    }

    console.log(`✅ Found Halaqah: ${halaqahUmar.namaHalaqah} (ID: ${halaqahUmar.id})`)

    // Get all santri
    const santriList = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      }
    })

    console.log(`✅ Found ${santriList.length} santri\n`)

    // Check existing HalaqahSantri
    const existingCount = await prisma.halaqahSantri.count({
      where: {
        halaqahId: halaqahUmar.id
      }
    })

    console.log(`📊 Existing HalaqahSantri records: ${existingCount}`)

    if (existingCount > 0) {
      console.log('⚠️  Data already exists. Skipping...')
      return
    }

    // Create HalaqahSantri for each santri
    const tahunAkademik = '2024/2025'
    const semester = 'S1'

    console.log('\n🔄 Creating HalaqahSantri records...')
    
    for (const santri of santriList) {
      await prisma.halaqahSantri.create({
        data: {
          halaqahId: halaqahUmar.id,
          santriId: santri.id,
          tahunAkademik: tahunAkademik,
          semester: semester
        }
      })
      console.log(`  ✓ ${santri.namaLengkap} → Halaqah ${halaqahUmar.namaHalaqah}`)
    }

    console.log('\n✅ Successfully populated HalaqahSantri!')
    console.log(`   Total records created: ${santriList.length}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

populateHalaqahSantri()
