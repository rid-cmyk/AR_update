// Test script for the new ujian system
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUjianSystem() {
  console.log('🧪 Testing Ujian System...')
  
  try {
    // Test 1: Check if juz fields exist in UjianSantri
    console.log('\n📊 Test 1: Checking UjianSantri schema...')
    const ujianSample = await prisma.ujianSantri.findFirst()
    if (ujianSample) {
      console.log('✅ UjianSantri table accessible')
      console.log('   Fields available:', Object.keys(ujianSample))
    } else {
      console.log('ℹ️  No ujian data found (this is normal for new setup)')
    }

    // Test 2: Check TemplateUjian with new enum values
    console.log('\n📋 Test 2: Checking TemplateUjian...')
    const templates = await prisma.templateUjian.findMany({
      take: 5,
      include: {
        komponenPenilaian: true
      }
    })
    console.log(`✅ Found ${templates.length} template(s)`)
    templates.forEach(t => {
      console.log(`   - ${t.namaTemplate} (${t.jenisUjian})`)
    })

    // Test 3: Check NilaiUjian nullable komponenPenilaianId
    console.log('\n📈 Test 3: Checking NilaiUjian schema...')
    const nilaiSample = await prisma.nilaiUjian.findFirst()
    if (nilaiSample) {
      console.log('✅ NilaiUjian table accessible')
      console.log('   Sample data:', {
        id: nilaiSample.id,
        komponenPenilaianId: nilaiSample.komponenPenilaianId,
        urutan: nilaiSample.urutan || 'not set'
      })
    } else {
      console.log('ℹ️  No nilai data found (this is normal for new setup)')
    }

    // Test 4: Check enum values
    console.log('\n🏷️  Test 4: Testing enum values...')
    const enumTest = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::\"JenisUjianTemplate\")) as jenis_ujian
    `
    console.log('✅ Available JenisUjianTemplate values:')
    enumTest.forEach(item => {
      console.log(`   - ${item.jenis_ujian}`)
    })

    console.log('\n🎉 All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 Suggestion: Run the migration script first:')
      console.log('   npm run migrate:ujian')
      console.log('   or manually run: scripts/update-ujian-system.sql')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testUjianSystem().catch(console.error)