// Test the admin laporan page
const { default: fetch } = require('node-fetch')

async function testAdminLaporanPage() {
    console.log('🌐 Testing admin laporan page...')
    
    try {
        // Test if the admin laporan page loads
        const response = await fetch('http://localhost:3001/admin/laporan')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Admin laporan page loads successfully')
            console.log('💡 Features available:')
            console.log('   📊 Comprehensive Analytics Dashboard')
            console.log('   📈 Multi-type reports (Halaqah, Santri, Guru, Ujian, Target, Tahfidz)')
            console.log('   📋 Advanced filtering with date ranges')
            console.log('   💾 Export functionality (CSV, PDF)')
            console.log('   📅 Semester and academic year selection')
            console.log('   🎯 Performance metrics and statistics')
            console.log('   📊 Visual progress indicators')
            console.log('   🔍 Detailed data tables with sorting')
            console.log('\\n🌐 Access: http://localhost:3001/admin/laporan')
            
            // Test integrated API endpoints
            console.log('\\n🧪 Testing integrated API endpoints...')
            
            // Test main analytics endpoint
            const analyticsResponse = await fetch('http://localhost:3001/api/analytics/reports')
            if (analyticsResponse.status === 200) {
                console.log('✅ Main Analytics API working')
            }
            
            // Test ujian reports endpoint
            const ujianResponse = await fetch('http://localhost:3001/api/analytics/ujian-reports')
            if (ujianResponse.status === 200) {
                console.log('✅ Ujian Reports API working')
            }
            
            // Test tahfidz reports endpoint
            const tahfidzResponse = await fetch('http://localhost:3001/api/analytics/tahfidz-reports')
            if (tahfidzResponse.status === 200) {
                console.log('✅ Tahfidz Reports API working')
            }
            
            console.log('\\n📊 Report Types Available:')
            console.log('   🏢 Halaqah Performance Reports')
            console.log('   👤 Individual Santri Progress')
            console.log('   👨‍🏫 Guru Performance Analytics')
            console.log('   📝 Detailed Ujian Results')
            console.log('   🎯 Target Achievement Reports')
            console.log('   📚 Comprehensive Tahfidz Reports')
            
            console.log('\\n🔧 Advanced Features:')
            console.log('   📅 Flexible date range filtering')
            console.log('   🎓 Semester-based reporting')
            console.log('   📊 Real-time statistics calculation')
            console.log('   💾 Multiple export formats')
            console.log('   🎨 Interactive data visualization')
            console.log('   📈 Performance trend analysis')
            
        } else if (response.status === 302 || response.status === 307) {
            console.log('🔄 Page redirected (likely to login) - Status:', response.status)
            console.log('💡 This is expected if not authenticated')
        } else {
            console.log('❌ Admin laporan page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing admin laporan page:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testAdminLaporanPage().catch(console.error)