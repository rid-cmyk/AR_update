// Test the guru laporan ujian API
const { default: fetch } = require('node-fetch')

async function testGuruLaporanAPI() {
    console.log('🧪 Testing Guru Laporan Ujian API...')
    
    const baseUrl = 'http://localhost:3001'
    
    try {
        // Test 1: Summary Report
        console.log('\n📊 Testing Summary Report...')
        const summaryResponse = await fetch(`${baseUrl}/api/guru/laporan-ujian?format=summary&periode=bulan-ini`)
        const summaryResult = await summaryResponse.json()
        
        console.log('Summary Response Status:', summaryResponse.status)
        if (summaryResult.success) {
            console.log('✅ Summary Report Success')
            console.log('📈 Summary Data:', {
                totalUjian: summaryResult.data.summary?.totalUjian || 0,
                nilaiRataRata: summaryResult.data.summary?.nilaiRataRata || 0,
                periode: summaryResult.data.summary?.periode || 'unknown'
            })
            
            if (summaryResult.data.byJenisUjian) {
                console.log('📚 By Jenis Ujian:', Object.keys(summaryResult.data.byJenisUjian))
            }
            
            if (summaryResult.data.performanceCategories) {
                console.log('🎯 Performance Categories:', summaryResult.data.performanceCategories)
            }
        } else {
            console.log('❌ Summary Report Failed:', summaryResult.message)
        }

        // Test 2: Detail Report
        console.log('\n📋 Testing Detail Report...')
        const detailResponse = await fetch(`${baseUrl}/api/guru/laporan-ujian?format=detail&periode=semester-ini`)
        const detailResult = await detailResponse.json()
        
        console.log('Detail Response Status:', detailResponse.status)
        if (detailResult.success) {
            console.log('✅ Detail Report Success')
            console.log('📊 Detail Records:', detailResult.data?.length || 0)
            console.log('🔍 Metadata:', detailResult.metadata)
        } else {
            console.log('❌ Detail Report Failed:', detailResult.message)
        }

        // Test 3: Export Data
        console.log('\n💾 Testing Export Data...')
        const exportResponse = await fetch(`${baseUrl}/api/guru/laporan-ujian?format=export&periode=tahun-ini&jenisUjian=tasmi`)
        const exportResult = await exportResponse.json()
        
        console.log('Export Response Status:', exportResponse.status)
        if (exportResult.success) {
            console.log('✅ Export Data Success')
            console.log('📤 Export Records:', exportResult.data?.length || 0)
            console.log('📅 Export Metadata:', exportResult.metadata)
            
            if (exportResult.data && exportResult.data.length > 0) {
                console.log('📝 Sample Export Fields:', Object.keys(exportResult.data[0]))
            }
        } else {
            console.log('❌ Export Data Failed:', exportResult.message)
        }

        // Test 4: Filtered Report
        console.log('\n🔍 Testing Filtered Report...')
        const filteredResponse = await fetch(`${baseUrl}/api/guru/laporan-ujian?format=summary&jenisUjian=tahfidz&halaqah=umar`)
        const filteredResult = await filteredResponse.json()
        
        console.log('Filtered Response Status:', filteredResponse.status)
        if (filteredResult.success) {
            console.log('✅ Filtered Report Success')
            console.log('🎯 Filtered Summary:', filteredResult.data.summary)
        } else {
            console.log('❌ Filtered Report Failed:', filteredResult.message)
        }

        // Test 5: Invalid Parameters
        console.log('\n⚠️ Testing Invalid Parameters...')
        const invalidResponse = await fetch(`${baseUrl}/api/guru/laporan-ujian?format=invalid&periode=invalid`)
        const invalidResult = await invalidResponse.json()
        
        console.log('Invalid Response Status:', invalidResponse.status)
        console.log('Invalid Response:', invalidResult.success ? '✅ Handled gracefully' : '❌ Error handled')

        console.log('\n🎉 Guru Laporan API Test Complete!')
        console.log('\n🌐 Available Endpoints:')
        console.log('   📊 Summary: /api/guru/laporan-ujian?format=summary')
        console.log('   📋 Detail: /api/guru/laporan-ujian?format=detail')
        console.log('   💾 Export: /api/guru/laporan-ujian?format=export')
        console.log('\n🔧 Available Filters:')
        console.log('   📅 periode: bulan-ini, semester-ini, tahun-ini')
        console.log('   📚 jenisUjian: tasmi, tahfidz, mhq')
        console.log('   👥 halaqah: umar, ali, abu-bakar')
        
    } catch (error) {
        console.error('❌ Error testing Guru Laporan API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruLaporanAPI().catch(console.error)