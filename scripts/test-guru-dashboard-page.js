// Test if the guru dashboard page loads properly
const { default: fetch } = require('node-fetch')

async function testGuruDashboardPage() {
    console.log('🌐 Testing guru dashboard page...')
    
    try {
        // Test if the page loads (this will test the API calls)
        const response = await fetch('http://localhost:3001/guru/dashboard')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Guru dashboard page loads successfully')
            console.log('💡 You can now visit http://localhost:3000/guru/dashboard in your browser')
        } else if (response.status === 302 || response.status === 307) {
            console.log('🔄 Page redirected (likely to login) - Status:', response.status)
            console.log('💡 This is expected if not authenticated')
        } else {
            console.log('❌ Dashboard page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing dashboard:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruDashboardPage().catch(console.error)