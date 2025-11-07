// Test the guru dashboard analytics API endpoint
const { default: fetch } = require('node-fetch')

async function testGuruDashboardApi() {
    console.log('🌐 Testing /api/analytics/guru-dashboard endpoint...')
    
    try {
        const response = await fetch('http://localhost:3001/api/analytics/guru-dashboard')
        const data = await response.json()
        
        console.log('📡 Response Status:', response.status)
        console.log('📊 Response Data:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success && data.overview) {
            console.log(`\n✅ Success! Dashboard analytics loaded`)
            console.log(`   - Total Santri: ${data.overview.totalSantri}`)
            console.log(`   - Hafalan Today: ${data.overview.totalHafalanToday}`)
            console.log(`   - Absensi Rate: ${data.overview.absensiRate}%`)
            console.log(`   - Hafalan Rate: ${data.overview.hafalanRate}%`)
            console.log(`   - Target Tertunda: ${data.overview.targetTertunda}`)
        } else {
            console.log('❌ API returned error or no data')
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruDashboardApi().catch(console.error)