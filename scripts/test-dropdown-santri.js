// Test script untuk dropdown santri di ujian
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDropdownSantri() {
  console.log('🧪 Testing Dropdown Santri untuk Ujian...')
  
  try {
    // Test 1: Cari guru yang ada
    console.log('\n📊 Test 1: Mencari guru yang tersedia...')
    
    const allGuru = await prisma.user.findMany({
      where: { role: 'GURU' },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      }
    })
    
    console.log(`✅ Found ${allGuru.length} guru(s):`)
    allGuru.forEach(g => {
      console.log(`   - ${g.namaLengkap} (@${g.username}) - ID: ${g.id}`)
    })
    
    if (allGuru.length === 0) {
      console.log('❌ No guru found. Please create guru first.')
      return
    }
    
    // Test 2: Test setiap guru untuk lihat halaqah dan santri
    for (const guru of allGuru.slice(0, 3)) { // Test first 3 guru only
      console.log(`\n📋 Test 2: Testing guru ${guru.namaLengkap}...`)
      
      // Method 1: Using guruHalaqah relation
      const guruWithHalaqah = await prisma.user.findUnique({
        where: { id: guru.id },
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
      
      if (guruWithHalaqah?.guruHalaqah && guruWithHalaqah.guruHalaqah.length > 0) {
        console.log(`   ✅ Via guruHalaqah: ${guruWithHalaqah.guruHalaqah.length} halaqah`)
        
        const santriList = guruWithHalaqah.guruHalaqah.flatMap(halaqah => 
          halaqah.santri.map(hs => ({
            id: hs.santri.id,
            namaLengkap: hs.santri.namaLengkap,
            username: hs.santri.username,
            halaqah: halaqah.namaHalaqah
          }))
        )
        
        console.log(`   📚 Santri available: ${santriList.length}`)
        santriList.forEach(s => {
          console.log(`      - ${s.namaLengkap} (@${s.username}) - ${s.halaqah}`)
        })
        
        if (santriList.length > 0) {
          console.log(`   🎉 SUCCESS: Guru ${guru.namaLengkap} has ${santriList.length} santri for ujian!`)
          break // Found working guru, stop testing
        }
      } else {
        console.log(`   ❌ Via guruHalaqah: No halaqah found`)
        
        // Method 2: Try direct guruId relation
        const directHalaqah = await prisma.halaqah.findMany({
          where: { guruId: guru.id },
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
          console.log(`   ✅ Via direct guruId: ${directHalaqah.length} halaqah`)
          
          const santriList = directHalaqah.flatMap(halaqah => 
            halaqah.santri.map(hs => ({
              id: hs.santri.id,
              namaLengkap: hs.santri.namaLengkap,
              username: hs.santri.username,
              halaqah: halaqah.namaHalaqah
            }))
          )
          
          console.log(`   📚 Santri available: ${santriList.length}`)
          santriList.forEach(s => {
            console.log(`      - ${s.namaLengkap} (@${s.username}) - ${s.halaqah}`)
          })
          
          if (santriList.length > 0) {
            console.log(`   🎉 SUCCESS: Guru ${guru.namaLengkap} has ${santriList.length} santri via direct relation!`)
            console.log(`   💡 API should use direct guruId instead of guruHalaqah`)
          }
        } else {
          console.log(`   ❌ Via direct guruId: No halaqah found`)
        }
      }
    }
    
    // Test 3: Check halaqah assignment status
    console.log('\n🔍 Test 3: Checking halaqah assignment status...')
    
    const allHalaqah = await prisma.halaqah.findMany({
      include: {
        santri: true,
        guru: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    })
    
    console.log(`📊 Total halaqah: ${allHalaqah.length}`)
    
    const assignedHalaqah = allHalaqah.filter(h => h.guruId)
    const unassignedHalaqah = allHalaqah.filter(h => !h.guruId)
    
    console.log(`✅ Assigned halaqah: ${assignedHalaqah.length}`)
    assignedHalaqah.forEach(h => {
      console.log(`   - ${h.namaHalaqah} → ${h.guru?.namaLengkap} (${h.santri.length} santri)`)
    })
    
    console.log(`❌ Unassigned halaqah: ${unassignedHalaqah.length}`)
    unassignedHalaqah.forEach(h => {
      console.log(`   - ${h.namaHalaqah} (${h.santri.length} santri) - NO GURU`)
    })
    
    // Test 4: Recommendations
    console.log('\n💡 Test 4: Recommendations...')
    
    if (unassignedHalaqah.length > 0) {
      console.log('🔧 To fix unassigned halaqah:')
      unassignedHalaqah.forEach(h => {
        console.log(`   UPDATE "Halaqah" SET "guruId" = [guru_id] WHERE id = ${h.id}; -- ${h.namaHalaqah}`)
      })
    }
    
    const emptyHalaqah = allHalaqah.filter(h => h.santri.length === 0)
    if (emptyHalaqah.length > 0) {
      console.log('\n🔧 Halaqah without santri:')
      emptyHalaqah.forEach(h => {
        console.log(`   - ${h.namaHalaqah} (assigned to: ${h.guru?.namaLengkap || 'No guru'})`)
      })
      console.log('   Add santri to these halaqah via HalaqahSantri table')
    }
    
    console.log('\n🎉 Dropdown santri test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDropdownSantri().catch(console.error)