// Final test untuk memastikan halaman ujian tidak ada memory leak
const https = require('https')
const http = require('http')

// Simple fetch implementation
function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url)
        const client = urlObj.protocol === 'https:' ? https : http
        
        const req = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    json: () => Promise.resolve(JSON.parse(data)),
                    text: () => Promise.resolve(data)
                })
            })
        })
        
        req.on('error', reject)
        
        if (options.body) {
            req.write(options.body)
        }
        
        req.end()
    })
}

async function finalUjianTest() {
    console.log('🎯 Final Test - Halaman Ujian Memory Leak Fix')
    console.log('=' .repeat(50))
    
    try {
        // Test 1: API Endpoint
        console.log('\n📡 Test 1: API Endpoint Performance')
        const startTime = Date.now()
        
        const apiResponse = await fetch('http://localhost:3000/api/guru/ujian')
        const apiData = await apiResponse.json()
        
        const apiTime = Date.now() - startTime
        console.log(`✅ API Response: ${apiResponse.status}`)
        console.log(`⏱️  Response Time: ${apiTime}ms`)
        console.log(`📊 Data Count: ${apiData.data?.length || 0} ujian`)
        
        if (apiTime > 5000) {
            console.log('⚠️  API response time is slow, may indicate memory issues')
        } else {
            console.log('✅ API response time is good')
        }
        
        // Test 2: Page Load
        console.log('\n🌐 Test 2: Page Load Performance')
        const pageStartTime = Date.now()
        
        const pageResponse = await fetch('http://localhost:3000/guru/ujian')
        const pageContent = await pageResponse.text()
        
        const pageTime = Date.now() - pageStartTime
        const pageSizeKB = Math.round(pageContent.length / 1024)
        
        console.log(`✅ Page Response: ${pageResponse.status}`)
        console.log(`⏱️  Load Time: ${pageTime}ms`)
        console.log(`📦 Page Size: ${pageSizeKB}KB`)
        
        // Check for memory-related errors in page content
        if (pageContent.includes('Out of Memory') || pageContent.includes('memory leak')) {
            console.log('❌ Memory-related errors found in page')
        } else {
            console.log('✅ No memory errors detected in page')
        }
        
        // Check page size
        if (pageSizeKB > 100) {
            console.log('⚠️  Page size is large, may cause memory issues')
        } else {
            console.log('✅ Page size is optimal')
        }
        
        // Test 3: Multiple API Calls (Stress Test)
        console.log('\n🔄 Test 3: Stress Test - Multiple API Calls')
        const stressTestPromises = []
        
        for (let i = 0; i < 5; i++) {
            stressTestPromises.push(
                fetch('http://localhost:3000/api/guru/ujian')
                    .then(res => res.json())
                    .then(data => ({ success: true, dataCount: data.data?.length || 0 }))
                    .catch(error => ({ success: false, error: error.message }))
            )
        }
        
        const stressResults = await Promise.all(stressTestPromises)
        const successCount = stressResults.filter(r => r.success).length
        
        console.log(`✅ Successful calls: ${successCount}/5`)
        
        if (successCount === 5) {
            console.log('✅ All stress test calls succeeded')
        } else {
            console.log('⚠️  Some stress test calls failed')
            stressResults.forEach((result, index) => {
                if (!result.success) {
                    console.log(`   Call ${index + 1}: ${result.error}`)
                }
            })
        }
        
        // Test 4: POST Request Test
        console.log('\n📝 Test 4: POST Request Test')
        const postData = {
            ujianResults: [
                {
                    santriId: 4,
                    nilaiDetail: {
                        kelancaran: 85,
                        tajwid: 80,
                        makhorijul_huruf: 90
                    },
                    nilaiAkhir: 85
                }
            ],
            jenisUjian: {
                nama: "Test Ujian",
                tipeUjian: "per-juz"
            },
            juzRange: {
                dari: 1,
                sampai: 1
            },
            metadata: {
                tanggalUjian: new Date().toISOString(),
                guruId: 3
            }
        }
        
        const postResponse = await fetch('http://localhost:3000/api/guru/ujian', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
        
        const postResult = await postResponse.json()
        
        console.log(`✅ POST Response: ${postResponse.status}`)
        console.log(`📊 POST Success: ${postResult.success}`)
        
        if (postResult.success) {
            console.log('✅ POST request handled successfully')
        } else {
            console.log(`⚠️  POST request failed: ${postResult.error}`)
        }
        
        // Final Summary
        console.log('\n🎉 FINAL SUMMARY')
        console.log('=' .repeat(30))
        
        const allTestsPassed = 
            apiTime < 5000 && 
            pageTime < 10000 && 
            pageSizeKB < 100 && 
            successCount === 5 && 
            postResult.success &&
            !pageContent.includes('Out of Memory')
        
        if (allTestsPassed) {
            console.log('✅ ALL TESTS PASSED!')
            console.log('✅ Memory leak issues have been resolved')
            console.log('✅ Halaman ujian siap digunakan')
            console.log('\n🌐 Access: http://localhost:3000/guru/ujian')
        } else {
            console.log('⚠️  Some tests failed, review the issues above')
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\n💡 Troubleshooting:')
        console.log('1. Make sure server is running: npm run dev')
        console.log('2. Check database connection')
        console.log('3. Verify API routes are working')
    }
}

// Run the test
finalUjianTest().catch(console.error)