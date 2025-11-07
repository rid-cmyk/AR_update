// Test if the santri hafalan page loads properly
const { default: fetch } = require('node-fetch')

async function testSantriHafalanPage() {
    console.log('🌐 Testing santri hafalan page...')
    
    try {
        // Test if the page loads (this will test the API calls)
        const response = await fetch('http://localhost:3001/santri/hafalan')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Santri hafalan page loads successfully')
            console.log('💡 You can now visit http://localhost:3001/santri/hafalan in your browser')
        } else if (response.status === 302 || response.status === 307) {
            console.log('🔄 Page redirected (likely to login) - Status:', response.status)
            console.log('💡 This is expected if not authenticated')
        } else {
            console.log('❌ Hafalan page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing hafalan page:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testSantriHafalanPage().catch(console.error)