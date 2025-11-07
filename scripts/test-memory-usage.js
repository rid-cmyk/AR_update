// Test memory usage untuk halaman ujian
const puppeteer = require('puppeteer')

async function testMemoryUsage() {
    console.log('🧪 Testing Memory Usage for Ujian Page...')
    
    let browser
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        
        const page = await browser.newPage()
        
        // Monitor memory usage
        await page.evaluateOnNewDocument(() => {
            window.memoryStats = []
            setInterval(() => {
                if (performance.memory) {
                    window.memoryStats.push({
                        timestamp: Date.now(),
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                    })
                }
            }, 1000)
        })
        
        console.log('📊 Navigating to ujian page...')
        await page.goto('http://localhost:3000/guru/ujian', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        })
        
        console.log('✅ Page loaded successfully')
        
        // Wait and collect memory stats
        await page.waitForTimeout(5000)
        
        const memoryStats = await page.evaluate(() => window.memoryStats)
        
        if (memoryStats && memoryStats.length > 0) {
            const latest = memoryStats[memoryStats.length - 1]
            const initial = memoryStats[0]
            
            console.log('📈 Memory Usage Stats:')
            console.log(`   Initial: ${(initial.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
            console.log(`   Current: ${(latest.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
            console.log(`   Growth: ${((latest.usedJSHeapSize - initial.usedJSHeapSize) / 1024 / 1024).toFixed(2)} MB`)
            console.log(`   Limit: ${(latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
            
            if (latest.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
                console.log('⚠️  High memory usage detected!')
            } else {
                console.log('✅ Memory usage is normal')
            }
        }
        
        // Test creating ujian (click button)
        console.log('🔄 Testing ujian creation...')
        try {
            await page.click('button:has-text("Ujian Baru")', { timeout: 5000 })
            console.log('✅ Ujian dialog opened successfully')
            
            // Wait a bit more and check memory
            await page.waitForTimeout(3000)
            
            const finalStats = await page.evaluate(() => {
                const stats = window.memoryStats
                return stats[stats.length - 1]
            })
            
            if (finalStats) {
                console.log(`📊 Memory after dialog: ${(finalStats.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
            }
            
        } catch (error) {
            console.log('⚠️  Could not test ujian creation:', error.message)
        }
        
        console.log('🎉 Memory test completed!')
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        
        if (error.message.includes('Out of Memory')) {
            console.log('💡 Memory leak detected! Check:')
            console.log('   - Large components not being cleaned up')
            console.log('   - Event listeners not removed')
            console.log('   - State updates after component unmount')
            console.log('   - Heavy rendering loops')
        }
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

// Run the test
testMemoryUsage().catch(console.error)