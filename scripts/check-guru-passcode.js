// Script untuk cek passcode guru
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkGuruPasscode() {
  try {
    console.log('🔍 Checking Guru passcodes...\n')

    const guruList = await prisma.user.findMany({
      where: {
        role: {
          name: 'guru'
        }
      },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        passCode: true
      }
    })

    console.log(`Found ${guruList.length} guru:\n`)
    
    guruList.forEach((guru, index) => {
      console.log(`${index + 1}. ${guru.namaLengkap} (${guru.username})`)
      console.log(`   ID: ${guru.id}`)
      console.log(`   PassCode: ${guru.passCode || 'NOT SET'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkGuruPasscode()
