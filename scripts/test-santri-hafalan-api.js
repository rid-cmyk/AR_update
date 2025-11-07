// Test the santri hafalan API endpoint
const { default: fetch } = require('node-fetch')

async function testSantriHafalanApi() {
    console.log('🌐 Testing /api/santri/hafalan endpoint...')
    
    try {
        const response = await fetch('http://localhost:3001/api/santri/hafalan')
        const data = await response.json()
        
        console.log('📡 Response Status:', response.status)
        console.log('📊 Response Data:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success && data.data) {
            console.log(`\n✅ Success! Hafalan data loaded`)
            console.log(`   - Progress Data Points: ${data.data.hafalanProgress?.length || 0}`)
            console.log(`   - Recent Hafalan: ${data.data.recentHafalan?.length || 0}`)
            console.log(`   - Active Targets: ${data.data.targets?.length || 0}`)
            
            if (data.data.stats) {
                console.log(`   - Total Ayat: ${data.data.stats.totalAyat}`)
                console.log(`   - Total Setoran: ${data.data.stats.totalSetoran}`)
                console.log(`   - Streak Days: ${data.data.stats.streakDays}`)
                console.log(`   - Average Daily: ${data.data.stats.averageDaily}`)
                console.log(`   - Target Completion: ${data.data.stats.targetCompletion}%`)
            }

            // Test target data structure
            if (data.data.targets && data.data.targets.length > 0) {
                console.log(`\n🎯 Target Details:`)
                data.data.targets.slice(0, 3).forEach(target => {
                    console.log(`   - ${target.judul} (Juz ${target.juzTarget || 'N/A'})`)
                    console.log(`     Progress: ${target.currentAyat}/${target.targetAyat} ayat`)
                    console.log(`     Status: ${target.status}`)
                })
            }
        } else {
            console.log('❌ API returned error or no data')
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testSantriHafalanApi().catch(console.error)