// Test the ujian API endpoint
const { default: fetch } = require('node-fetch')

async function testUjianApi() {
    console.log('🌐 Testing /api/guru/ujian endpoint...')
    
    try {
        const response = await fetch('http://localhost:3000/api/guru/ujian')
        const data = await response.json()
        
        console.log('📡 Response Status:', response.status)
        console.log('📊 Response Data:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success && data.data) {
            console.log(`\n✅ Success! Found ${data.data.length} ujian`)
            data.data.forEach(ujian => {
                console.log(`   - ${ujian.santriNama} - ${ujian.jenisUjian} - Nilai: ${ujian.nilaiAkhir}`)
            })
        } else {
            console.log('❌ API returned error or no data')
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testUjianApi().catch(console.error)