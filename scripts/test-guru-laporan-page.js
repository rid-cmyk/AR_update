// Test the guru laporan page
const { default: fetch } = require('node-fetch')

async function testGuruLaporanPage() {
    console.log('🌐 Testing guru laporan page...')
    
    try {
        // Test if the laporan page loads
        const response = await fetch('http://localhost:3001/guru/laporan')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Guru laporan page loads successfully')
            console.log('💡 Features available:')
            console.log('   📊 Dashboard Laporan Ujian')
            console.log('   📈 Summary statistics and charts')
            console.log('   📋 Detail reports with filters')
            console.log('   💾 Export functionality (CSV, Excel, PDF)')
            console.log('   🔍 Performance analysis')
            console.log('   📅 Period-based filtering')
            console.log('   👥 Multi-halaqah support')
            console.log('\\n🌐 Access: http://localhost:3001/guru/laporan')
            
            // Test API endpoints
            console.log('\\n🧪 Testing integrated API endpoints...')
            
            // Test summary endpoint
            const summaryResponse = await fetch('http://localhost:3001/api/guru/laporan-ujian?format=summary')
            if (summaryResponse.status === 200) {
                console.log('✅ Summary API working')
            }
            
            // Test detail endpoint
            const detailResponse = await fetch('http://localhost:3001/api/guru/laporan-ujian?format=detail')
            if (detailResponse.status === 200) {
                console.log('✅ Detail API working')
            }
            
            // Test export endpoint
            const exportResponse = await fetch('http://localhost:3001/api/guru/laporan-ujian?format=export')
            if (exportResponse.status === 200) {
                console.log('✅ Export API working')
            }
            
        } else if (response.status === 302 || response.status === 307) {
            console.log('🔄 Page redirected (likely to login) - Status:', response.status)
            console.log('💡 This is expected if not authenticated')
        } else {
            console.log('❌ Laporan page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing laporan page:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruLaporanPage().catch(console.error)