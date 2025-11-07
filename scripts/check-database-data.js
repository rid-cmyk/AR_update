// Check database data to understand current state
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseData() {
    console.log('🔍 Checking database data...')

    try {
        // Check roles
        console.log('\n📋 Available roles:')
        const roles = await prisma.role.findMany()
        roles.forEach(role => {
            console.log(`   - ${role.name} (ID: ${role.id})`)
        })

        // Check users
        console.log('\n👥 Available users:')
        const users = await prisma.user.findMany({
            include: {
                role: true
            },
            take: 10
        })
        
        if (users.length === 0) {
            console.log('   ❌ No users found in database')
        } else {
            users.forEach(user => {
                console.log(`   - ${user.namaLengkap} (@${user.username}) - Role: ${user.role.name}`)
            })
        }

        // Check halaqah
        console.log('\n🏫 Available halaqah:')
        const halaqah = await prisma.halaqah.findMany({
            include: {
                guru: {
                    include: {
                        role: true
                    }
                },
                santri: true
            }
        })
        
        if (halaqah.length === 0) {
            console.log('   ❌ No halaqah found in database')
        } else {
            halaqah.forEach(h => {
                const guruInfo = h.guru ? `${h.guru.namaLengkap} (${h.guru.role.name})` : 'No guru assigned'
                console.log(`   - ${h.namaHalaqah} - Guru: ${guruInfo} - Santri: ${h.santri.length}`)
            })
        }

        // Check halaqah santri relations
        console.log('\n🔗 HalaqahSantri relations:')
        const halaqahSantri = await prisma.halaqahSantri.findMany({
            include: {
                halaqah: true,
                santri: {
                    include: {
                        role: true
                    }
                }
            },
            take: 10
        })
        
        if (halaqahSantri.length === 0) {
            console.log('   ❌ No halaqah-santri relations found')
        } else {
            halaqahSantri.forEach(hs => {
                console.log(`   - ${hs.santri.namaLengkap} (${hs.santri.role.name}) in ${hs.halaqah.namaHalaqah}`)
            })
        }

    } catch (error) {
        console.error('❌ Error checking database:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkDatabaseData().catch(console.error)