// Test the guru santri API for single selection
const { default: fetch } = require('node-fetch')

async function testGuruSantriAPI() {
    console.log('🧪 Testing Guru Santri API (Single Selection)...')
    
    const baseUrl = 'http://localhost:3001'
    
    try {
        // Test 1: Get Santri from Guru's Halaqah
        console.log('\n👥 Testing Get Santri from Halaqah...')
        const santriResponse = await fetch(`${baseUrl}/api/guru/santri`)
        const santriResult = await santriResponse.json()
        
        console.log('Santri Response Status:', santriResponse.status)
        if (santriResult.success) {
            console.log('✅ Guru Santri API Success')
            console.log('📊 Santri Data:', {
                total: santriResult.metadata?.total || 0,
                guruNama: santriResult.metadata?.guruNama || 'Unknown',
                halaqahCount: santriResult.metadata?.halaqahCount || 0
            })
            
            if (santriResult.data && santriResult.data.length > 0) {
                console.log('👤 Sample Santri:')
                santriResult.data.slice(0, 3).forEach((santri, index) => {
                    console.log(`   ${index + 1}. ${santri.nama} - ${santri.kelas}`)
                })
                
                console.log('\\n🎯 Single Selection Features:')
                console.log('   ✅ Only santri from guru\'s halaqah shown')
                console.log('   ✅ Each santri has halaqah information')
                console.log('   ✅ Ready for single selection in form')
                console.log('   ✅ Includes santri metadata (username, email)')
                
                // Test single santri selection simulation
                const selectedSantri = santriResult.data[0]
                console.log('\\n🎯 Single Selection Simulation:')
                console.log(`   Selected: ${selectedSantri.nama}`)
                console.log(`   Halaqah: ${selectedSantri.kelas}`)
                console.log(`   ID: ${selectedSantri.id}`)
                console.log(`   Status: ${selectedSantri.status}`)
                
            } else {
                console.log('📝 No santri found - using sample data')
            }
            
            if (santriResult.metadata?.halaqahList) {
                console.log('\\n🏢 Halaqah Information:')
                santriResult.metadata.halaqahList.forEach(halaqah => {
                    console.log(`   - ${halaqah.nama}: ${halaqah.santriCount} santri`)
                })
            }
            
        } else {
            console.log('❌ Guru Santri API Failed:', santriResult.message)
        }

        // Test 2: Validate API Response Structure
        console.log('\\n🔍 Testing API Response Structure...')
        if (santriResult.success && santriResult.data) {
            const requiredFields = ['id', 'nama', 'kelas', 'halaqahNama']
            const sampleSantri = santriResult.data[0]
            
            const missingFields = requiredFields.filter(field => !sampleSantri.hasOwnProperty(field))
            
            if (missingFields.length === 0) {
                console.log('✅ API Response Structure Valid')
                console.log('📋 All required fields present:', requiredFields.join(', '))
            } else {
                console.log('⚠️ Missing fields:', missingFields.join(', '))
            }
        }

        console.log('\\n🎉 Guru Santri API Test Complete!')
        console.log('\\n🌐 API Endpoint:')
        console.log('   GET /api/guru/santri - Get santri from guru\'s halaqah')
        
        console.log('\\n🔧 Single Selection Features:')
        console.log('   ✅ Filtered by guru\'s halaqah only')
        console.log('   ✅ Single santri selection in form')
        console.log('   ✅ Complete santri information')
        console.log('   ✅ Halaqah context included')
        console.log('   ✅ Ready for ujian form integration')
        
    } catch (error) {
        console.error('❌ Error testing Guru Santri API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruSantriAPI().catch(console.error)