// Test the actual API endpoint
const { default: fetch } = require('node-fetch')

async function testApiEndpoint() {
    console.log('🌐 Testing /api/guru/santri endpoint...')
    
    try {
        const response = await fetch('http://localhost:3000/api/guru/santri')
        const data = await response.json()
        
        console.log('📡 Response Status:', response.status)
        console.log('📊 Response Data:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success && data.data) {
            console.log(`\n✅ Success! Found ${data.data.length} santri`)
            data.data.forEach(santri => {
                console.log(`   - ${santri.nama} (@${santri.username}) - ${santri.halaqah}`)
            })
        } else {
            console.log('❌ API returned error or no data')
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testApiEndpoint().catch(console.error)