// Test the new mushaf API endpoints
const { default: fetch } = require('node-fetch')

async function testMushafAPI() {
    console.log('🕌 Testing Mushaf Digital API...\n')
    
    const baseUrl = 'http://localhost:3001'
    
    try {
        // Test 1: Get mushaf info
        console.log('📋 Test 1: Get mushaf info')
        const infoResponse = await fetch(`${baseUrl}/api/mushaf`)
        const infoResult = await infoResponse.json()
        
        if (infoResult.success) {
            console.log('✅ Mushaf info loaded successfully')
            console.log(`   Total Pages: ${infoResult.data.totalPages}`)
            console.log(`   Total Juz: ${infoResult.data.totalJuz}`)
        } else {
            console.log('❌ Failed to load mushaf info')
        }
        
        console.log('')
        
        // Test 2: Get juz mapping
        console.log('🗺️  Test 2: Get juz mapping')
        const mappingResponse = await fetch(`${baseUrl}/api/mushaf?action=mapping`)
        const mappingResult = await mappingResponse.json()
        
        if (mappingResult.success) {
            console.log('✅ Juz mapping loaded successfully')
            console.log('   Sample mappings:')
            mappingResult.data.summary.slice(0, 5).forEach(juz => {
                console.log(`   Juz ${juz.juz}: Pages ${juz.pageRange} (${juz.totalPages} pages) - ${juz.surah}`)
            })
        } else {
            console.log('❌ Failed to load juz mapping')
        }
        
        console.log('')
        
        // Test 3: Get specific juz pages
        console.log('📖 Test 3: Get Juz 1 pages')
        const juzResponse = await fetch(`${baseUrl}/api/mushaf?juz=1`)
        const juzResult = await juzResponse.json()
        
        if (juzResult.success) {
            console.log('✅ Juz 1 data loaded successfully')
            console.log(`   Juz: ${juzResult.data.juz}`)
            console.log(`   Page Range: ${juzResult.data.pageRange.start}-${juzResult.data.pageRange.end}`)
            console.log(`   Total Pages: ${juzResult.data.totalPages}`)
            console.log(`   Surah: ${juzResult.data.pageRange.surah}`)
        } else {
            console.log('❌ Failed to load Juz 1 data')
        }
        
        console.log('')
        
        // Test 4: Get specific page content
        console.log('📄 Test 4: Get Page 1 content')
        const pageResponse = await fetch(`${baseUrl}/api/mushaf?page=1`)
        const pageResult = await pageResponse.json()
        
        if (pageResult.success) {
            console.log('✅ Page 1 content loaded successfully')
            console.log(`   Page: ${pageResult.data.page}`)
            console.log(`   Juz: ${pageResult.data.juz}`)
            console.log(`   Surah Info: ${pageResult.data.surahInfo}`)
            console.log(`   Content Preview: ${pageResult.data.content.substring(0, 100)}...`)
        } else {
            console.log('❌ Failed to load Page 1 content')
        }
        
        console.log('')
        
        // Test 5: Test error handling
        console.log('🚫 Test 5: Test error handling (invalid page)')
        const errorResponse = await fetch(`${baseUrl}/api/mushaf?page=999`)
        const errorResult = await errorResponse.json()
        
        if (!errorResult.success && errorResponse.status === 400) {
            console.log('✅ Error handling works correctly')
            console.log(`   Error: ${errorResult.error}`)
        } else {
            console.log('❌ Error handling not working properly')
        }
        
        console.log('')
        console.log('🎉 Mushaf API testing completed!')
        console.log('💡 API Endpoints available:')
        console.log('   📋 Info: /api/mushaf')
        console.log('   🗺️  Mapping: /api/mushaf?action=mapping')
        console.log('   📖 Juz: /api/mushaf?juz={number}')
        console.log('   📄 Page: /api/mushaf?page={number}')
        
    } catch (error) {
        console.error('❌ Error testing mushaf API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testMushafAPI().catch(console.error)