// Test the guru santri API with real data
const { default: fetch } = require('node-fetch')

async function testGuruSantriRealData() {
    console.log('🧪 Testing Guru Santri API with Real Data...')
    
    try {
        // Test santri API
        const response = await fetch('http://localhost:3000/api/guru/santri')
        const result = await response.json()
        
        console.log('📡 Response Status:', response.status)
        
        if (result.success) {
            console.log('✅ Guru Santri API Success')
            console.log('📊 Summary:', result.data.summary)
            
            console.log('\n👥 Santri per Halaqah:')
            result.data.summary.santriPerHalaqah.forEach(h => {
                console.log(`   🏢 ${h.halaqah}`)
                console.log(`      👨‍🏫 Guru: ${h.guru}`)
                console.log(`      👤 Santri: ${h.jumlahSantri} orang`)
            })
            
            console.log('\n📋 Sample Santri Data:')
            if (result.data.santriList.length > 0) {
                const sample = result.data.santriList[0]
                console.log(`   👤 Nama: ${sample.namaLengkap}`)
                console.log(`   🏢 Halaqah: ${sample.halaqah?.namaHalaqah || 'Tidak ada'}`)
                console.log(`   👨‍🏫 Guru: ${sample.halaqah?.guru?.namaLengkap || 'Tidak ada'}`)
                console.log(`   📊 Statistics:`)
                console.log(`      📚 Total Hafalan: ${sample.statistics.totalHafalan}`)
                console.log(`      📝 Total Ujian: ${sample.statistics.totalUjian}`)
                console.log(`      🎯 Target Aktif: ${sample.statistics.targetAktif}`)
            }
            
            console.log('\n🏢 Halaqah Organization:')
            Object.keys(result.data.byHalaqah).forEach(halaqahName => {
                const halaqahData = result.data.byHalaqah[halaqahName]
                console.log(`   📍 ${halaqahName}:`)
                console.log(`      👨‍🏫 Guru: ${halaqahData.halaqah?.guru?.namaLengkap || 'Tidak ada guru'}`)
                console.log(`      👥 Jumlah Santri: ${halaqahData.santri.length}`)
                
                // Show first few santri names
                const santriNames = halaqahData.santri.slice(0, 3).map(s => s.namaLengkap)
                if (santriNames.length > 0) {
                    console.log(`      👤 Santri: ${santriNames.join(', ')}${halaqahData.santri.length > 3 ? '...' : ''}`)
                }
            })
            
        } else {
            console.log('❌ Guru Santri API Failed:', result.message)
        }
        
        // Test analytics with real data
        console.log('\n📊 Testing Analytics with Real Data...')
        const analyticsResponse = await fetch('http://localhost:3000/api/analytics/reports')
        const analyticsResult = await analyticsResponse.json()
        
        if (analyticsResult.success) {
            console.log('✅ Analytics API Success')
            console.log('📈 Analytics Summary:', analyticsResult.data.summary)
            
            if (analyticsResult.data.halaqahReports.length > 0) {
                console.log('\n🏢 Halaqah Reports:')
                analyticsResult.data.halaqahReports.forEach(h => {
                    console.log(`   📍 ${h.namaHalaqah}`)
                    console.log(`      👨‍🏫 Guru: ${h.namaGuru}`)
                    console.log(`      👥 Santri: ${h.totalSantri}`)
                    console.log(`      📚 Hafalan: ${h.totalHafalan}`)
                    console.log(`      📊 Attendance: ${h.attendanceRate}%`)
                })
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing Guru Santri Real Data:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruSantriRealData().catch(console.error)