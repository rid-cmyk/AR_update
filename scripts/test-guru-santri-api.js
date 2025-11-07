// Test script untuk API guru santri dengan relasi halaqahGuru
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testGuruSantriRelation() {
    console.log('🧪 Testing Guru-Santri API Relations (halaqahGuru)...')

    try {
        // Test 1: Check guru with halaqah using correct relation
        console.log('\n📊 Test 1: Checking guru with halaqah assignment...')

        const guruWithHalaqah = await prisma.user.findFirst({
            where: {
                role: {
                    name: 'guru'
                }
            },
            include: {
                guruHalaqah: {
                    include: {
                        santri: {
                            include: {
                                santri: {
                                    select: {
                                        id: true,
                                        namaLengkap: true,
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!guruWithHalaqah) {
            console.log('❌ No guru found in database')
            return
        }

        console.log(`✅ Found guru: ${guruWithHalaqah.namaLengkap} (ID: ${guruWithHalaqah.id})`)

        // Test 2: Check halaqah assigned to this guru
        console.log('\n📋 Test 2: Checking halaqah assignment via halaqahGuru relation...')

        if (!guruWithHalaqah.guruHalaqah || guruWithHalaqah.guruHalaqah.length === 0) {
            console.log('❌ No halaqah assigned to this guru via guruHalaqah relation')
            console.log('💡 Solution: Check halaqah assignment in admin panel')
            console.log('   Make sure guru is properly assigned to halaqah')

            // Check alternative: direct guruId in Halaqah table
            console.log('\n🔍 Checking alternative: direct guruId in Halaqah table...')
            const directHalaqah = await prisma.halaqah.findMany({
                where: { guruId: guruWithHalaqah.id },
                include: {
                    santri: {
                        include: {
                            santri: {
                                select: {
                                    id: true,
                                    namaLengkap: true,
                                    username: true
                                }
                            }
                        }
                    }
                }
            })

            if (directHalaqah.length > 0) {
                console.log(`✅ Found ${directHalaqah.length} halaqah(s) via direct guruId:`)
                directHalaqah.forEach(h => {
                    console.log(`   - ${h.namaHalaqah} (${h.santri.length} santri)`)
                })
                console.log('💡 API should use direct guruId relation instead of guruHalaqah')
            } else {
                console.log('❌ No halaqah found via direct guruId either')
            }
            return
        }

        console.log(`✅ Found ${guruWithHalaqah.guruHalaqah.length} halaqah(s) assigned to guru:`)
        guruWithHalaqah.guruHalaqah.forEach(h => {
            console.log(`   - ${h.namaHalaqah} (${h.santri.length} santri)`)
        })

        // Test 3: Extract santri list
        console.log('\n👥 Test 3: Extracting santri list...')

        const santriList = guruWithHalaqah.guruHalaqah.flatMap(halaqah =>
            halaqah.santri.map(halaqahSantri => ({
                id: halaqahSantri.santri.id,
                namaLengkap: halaqahSantri.santri.namaLengkap,
                username: halaqahSantri.santri.username,
                halaqah: {
                    namaHalaqah: halaqah.namaHalaqah
                }
            }))
        )

        console.log(`✅ Total santri available for ujian: ${santriList.length}`)
        santriList.forEach(s => {
            console.log(`   - ${s.namaLengkap} (@${s.username}) - ${s.halaqah.namaHalaqah}`)
        })

        // Test 4: Simulate API response
        console.log('\n🌐 Test 4: Simulating API response...')

        const apiResponse = {
            success: true,
            data: santriList,
            message: `Ditemukan ${santriList.length} santri dari ${guruWithHalaqah.guruHalaqah.length} halaqah`
        }

        console.log('📡 API Response:')
        console.log(JSON.stringify(apiResponse, null, 2))

        console.log('\n🎉 Test completed!')

        if (santriList.length === 0) {
            console.log('\n🔧 TROUBLESHOOTING:')
            console.log('1. Check halaqah assignment in admin dashboard')
            console.log('2. Make sure guru is assigned to halaqah properly')
            console.log('3. Make sure halaqah has santri assigned')
            console.log('4. Check if using correct relation (halaqahGuru vs direct guruId)')
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\n💡 Common issues:')
        console.log('- halaqahGuru relation might not exist in schema')
        console.log('- Relation name might be different (guruHalaqah instead of halaqahGuru)')
        console.log('- Database might use direct foreign key instead of junction table')
    } finally {
        await prisma.$disconnect()
    }
}

// Run the test
testGuruSantriRelation().catch(console.error)