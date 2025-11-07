// Test if the frontend ujian page loads properly
const { default: fetch } = require('node-fetch')

async function testFrontendUjian() {
    console.log('🌐 Testing frontend ujian page...')
    
    try {
        // Test if the page loads (this will test the API calls)
        const response = await fetch('http://localhost:3001/guru/ujian')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Frontend ujian page loads successfully')
            console.log('💡 You can now visit http://localhost:3001/guru/ujian in your browser')
        } else {
            console.log('❌ Frontend page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing frontend:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testFrontendUjian().catch(console.error)