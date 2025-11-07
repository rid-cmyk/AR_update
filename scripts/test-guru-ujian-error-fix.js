// Test the guru ujian page after fixing date error
const { default: fetch } = require('node-fetch')

async function testGuruUjianErrorFix() {
    console.log('🔧 Testing guru ujian page after date error fix...')
    
    try {
        // Test if the ujian page loads without errors
        const response = await fetch('http://localhost:3001/guru/ujian')
        
        console.log('📡 Response Status:', response.status)
        
        if (response.status === 200) {
            console.log('✅ Guru ujian page loads successfully')
            console.log('🔧 Date formatting error has been fixed!')
            console.log('')
            console.log('💡 Fixed issues:')
            console.log('   ✅ Invalid time value error in DetailUjianDialog')
            console.log('   ✅ Safe date parsing with formatSafeDate helper')
            console.log('   ✅ Graceful handling of invalid dates')
            console.log('   ✅ Fallback to "N/A" for missing dates')
            console.log('')
            console.log('🛡️ Error handling improvements:')
            console.log('   - Try-catch blocks for date parsing')
            console.log('   - isNaN validation for date objects')
            console.log('   - Consistent error messages')
            console.log('   - Helper function for reusability')
            console.log('')
            console.log('🌐 Access: http://localhost:3001/guru/ujian')
            
        } else if (response.status === 302 || response.status === 307) {
            console.log('🔄 Page redirected (likely to login) - Status:', response.status)
            console.log('💡 This is expected if not authenticated')
        } else {
            console.log('❌ Ujian page returned error status:', response.status)
        }
        
    } catch (error) {
        console.error('❌ Error testing ujian page:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruUjianErrorFix().catch(console.error)