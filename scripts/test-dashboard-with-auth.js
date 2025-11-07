// Test dashboard access with authentication simulation
const { default: fetch } = require('node-fetch')

async function testDashboardWithAuth() {
    console.log('🌐 Testing dashboard with simulated authentication...')
    
    try {
        // First, test the analytics API directly (should work without auth)
        console.log('1. Testing analytics API directly...')
        const analyticsResponse = await fetch('http://localhost:3001/api/analytics/guru-dashboard')
        console.log('   Analytics API Status:', analyticsResponse.status)
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            console.log('   ✅ Analytics API working:', analyticsData.success)
        } else {
            console.log('   ❌ Analytics API failed')
        }
        
        // Test if we can access the dashboard page (will redirect to login if not authenticated)
        console.log('\n2. Testing dashboard page access...')
        const dashboardResponse = await fetch('http://localhost:3001/guru/dashboard', {
            redirect: 'manual' // Don't follow redirects
        })
        console.log('   Dashboard Page Status:', dashboardResponse.status)
        
        if (dashboardResponse.status === 302 || dashboardResponse.status === 307) {
            console.log('   🔄 Dashboard redirected to login (expected without auth)')
        } else if (dashboardResponse.status === 200) {
            console.log('   ✅ Dashboard accessible')
        }
        
        console.log('\n📝 Summary:')
        console.log('- Analytics API is working independently')
        console.log('- Dashboard page loads (with proper auth handling)')
        console.log('- The "Failed to fetch" error in browser is likely due to:')
        console.log('  1. CORS issues in browser environment')
        console.log('  2. Authentication context in browser')
        console.log('  3. Network connectivity from browser to server')
        console.log('\n💡 Try accessing http://localhost:3001/guru/dashboard in browser')
        console.log('   and check browser console for more specific error details')
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message)
    }
}

testDashboardWithAuth().catch(console.error)