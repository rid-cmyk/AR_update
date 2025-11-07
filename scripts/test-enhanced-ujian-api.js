// Test script untuk enhanced ujian API dan analytics
const { default: fetch } = require('node-fetch')

async function testEnhancedUjianAPI() {
    console.log('🧪 Testing Enhanced Ujian API & Analytics...')
    
    const baseUrl = 'http://localhost:3002'
    
    try {
        // Test 1: Get Guru Santri Data
        console.log('\n📊 Test 1: Getting Guru Santri Data...')
        const santriResponse = await fetch(`${baseUrl}/api/guru/santri?includeStats=true`)
        
        if (santriResponse.ok) {
            const santriData = await santriResponse.json()
            console.log('✅ Guru Santri API Response:')
            console.log(`   - Total Halaqah: ${santriData.data.summary.totalHalaqah}`)
            console.log(`   - Total Santri: ${santriData.data.summary.totalSantri}`)
            console.log(`   - Average per Halaqah: ${santriData.data.summary.averagePerHalaqah}`)
            
            if (santriData.data.summary.stats) {
                console.log('   📈 Statistics:')
                console.log(`     - Total Hafalan: ${santriData.data.summary.stats.totalHafalan}`)
                console.log(`     - Total Ujian: ${santriData.data.summary.stats.totalUjian}`)
                console.log(`     - Average Score: ${santriData.data.summary.stats.averageScore}`)
                console.log(`     - Average Attendance: ${santriData.data.summary.stats.averageAttendance}%`)
            }
            
            // Show sample santri data
            if (santriData.data.santri.length > 0) {
                console.log('   👥 Sample Santri:')
                santriData.data.santri.slice(0, 3).forEach(santri => {
                    console.log(`     - ${santri.namaLengkap} (${santri.halaqah.namaHalaqah})`)
                    if (santri.stats) {
                        console.log(`       Hafalan: ${santri.stats.hafalan.totalRecord} records, ${santri.stats.hafalan.totalAyat} ayat`)
                        console.log(`       Ujian: ${santri.stats.ujian.totalUjian} ujian, avg: ${santri.stats.ujian.averageScore}`)
                        console.log(`       Kehadiran: ${santri.stats.absensi.attendanceRate}%`)
                    }
                })
            }
        } else {
            console.log(`❌ Guru Santri API failed: ${santriResponse.status}`)
        }

        // Test 2: Test Enhanced Ujian Submission
        console.log('\n📝 Test 2: Testing Enhanced Ujian Submission...')
        
        const sampleUjianData = {
            ujianResults: [
                {
                    santriId: 4,
                    nilaiDetail: {
                        "juz-1": 85,
                        "juz-2": 90,
                        "juz-3": 88
                    },
                    nilaiAkhir: 87.67,
                    catatan: "Bacaan sudah baik, perlu perbaikan tajwid di beberapa tempat",
                    completionStatus: 100
                },
                {
                    santriId: 5,
                    nilaiDetail: {
                        "juz-1": 92,
                        "juz-2": 89,
                        "juz-3": 91
                    },
                    nilaiAkhir: 90.67,
                    catatan: "Sangat baik, hafalan lancar dan tajwid benar",
                    completionStatus: 100
                }
            ],
            jenisUjian: {
                nama: "Tasmi'",
                tipeUjian: "per-juz"
            },
            juzRange: {
                dari: 1,
                sampai: 3
            },
            metadata: {
                evaluatorId: "guru1",
                evaluatorName: "Ustadz Ahmad",
                halaqahId: 1,
                halaqahName: "Al-Fatihah",
                sessionDuration: 45,
                evaluationMethod: "mushaf-digital"
            }
        }

        const ujianResponse = await fetch(`${baseUrl}/api/guru/ujian`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sampleUjianData)
        })

        if (ujianResponse.ok) {
            const ujianResult = await ujianResponse.json()
            console.log('✅ Enhanced Ujian Submission Success:')
            console.log(`   - Message: ${ujianResult.message}`)
            console.log('   📊 Summary:')
            console.log(`     - Total Santri: ${ujianResult.summary.totalSantri}`)
            console.log(`     - Average Score: ${ujianResult.summary.averageScore}`)
            console.log(`     - Completion Rate: ${ujianResult.summary.completionRate}%`)
            console.log(`     - Juz Range: ${ujianResult.summary.juzRange}`)
            console.log(`     - Evaluation Type: ${ujianResult.summary.evaluationType}`)
            
            // Show enhanced data structure
            if (ujianResult.data && ujianResult.data.length > 0) {
                console.log('   🔍 Enhanced Data Structure:')
                const sample = ujianResult.data[0]
                console.log(`     - Metadata: ${JSON.stringify(sample.metadata, null, 6)}`)
            }
        } else {
            const errorData = await ujianResponse.json()
            console.log(`❌ Enhanced Ujian Submission failed: ${ujianResponse.status}`)
            console.log(`   Error: ${errorData.error}`)
            if (errorData.details) {
                console.log(`   Details: ${errorData.details}`)
            }
        }

        // Test 3: Test Ujian Analytics API
        console.log('\n📈 Test 3: Testing Ujian Analytics API...')
        
        const analyticsResponse = await fetch(`${baseUrl}/api/analytics/ujian-analytics`)
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            console.log('✅ Ujian Analytics API Success:')
            console.log(`   - Message: ${analyticsData.message}`)
            
            if (analyticsData.data.summary) {
                console.log('   📊 Summary Analytics:')
                console.log(`     - Total Ujian: ${analyticsData.data.summary.totalUjian}`)
                console.log(`     - Total Santri: ${analyticsData.data.summary.totalSantri}`)
                console.log(`     - Average Score: ${analyticsData.data.summary.averageScore}`)
                console.log(`     - Pass Rate: ${analyticsData.data.summary.passRate}%`)
                console.log(`     - Excellence Rate: ${analyticsData.data.summary.excellenceRate}%`)
            }
            
            if (analyticsData.data.performanceDistribution) {
                console.log('   🎯 Performance Distribution:')
                const dist = analyticsData.data.performanceDistribution
                console.log(`     - Excellent (≥90): ${dist.excellent}`)
                console.log(`     - Good (80-89): ${dist.good}`)
                console.log(`     - Average (70-79): ${dist.average}`)
                console.log(`     - Needs Improvement (<70): ${dist.needsImprovement}`)
            }
            
            if (analyticsData.data.byJenisUjian) {
                console.log('   📚 By Jenis Ujian:')
                Object.entries(analyticsData.data.byJenisUjian).forEach(([jenis, data]) => {
                    console.log(`     - ${jenis}: ${data.count} ujian, avg: ${Math.round(data.averageScore * 100) / 100}`)
                })
            }
            
            if (analyticsData.data.topPerformers && analyticsData.data.topPerformers.length > 0) {
                console.log('   🏆 Top Performers:')
                analyticsData.data.topPerformers.slice(0, 3).forEach((performer, index) => {
                    console.log(`     ${index + 1}. ${performer.santri} - ${Math.round(performer.averageScore * 100) / 100} (${performer.totalUjian} ujian)`)
                })
            }
            
            if (analyticsData.data.trending) {
                console.log('   📈 Trending Data:')
                console.log(`     - Last 7 Days: ${analyticsData.data.trending.last7Days.count} ujian, avg: ${analyticsData.data.trending.last7Days.averageScore}`)
                console.log(`     - Last 30 Days: ${analyticsData.data.trending.last30Days.count} ujian, avg: ${analyticsData.data.trending.last30Days.averageScore}`)
            }
            
        } else {
            console.log(`❌ Ujian Analytics API failed: ${analyticsResponse.status}`)
        }

        // Test 4: Test Quran/Mushaf API
        console.log('\n📖 Test 4: Testing Quran/Mushaf API...')
        
        const mushafResponse = await fetch(`${baseUrl}/api/quran?action=mushaf&juz=1`)
        
        if (mushafResponse.ok) {
            const mushafData = await mushafResponse.json()
            console.log('✅ Mushaf API Success:')
            console.log(`   - Juz: ${mushafData.data.juz}`)
            console.log(`   - Page Range: ${mushafData.data.pageRange.start} - ${mushafData.data.pageRange.end}`)
            console.log(`   - Total Pages: ${mushafData.data.totalPages}`)
        } else {
            console.log(`❌ Mushaf API failed: ${mushafResponse.status}`)
        }

        // Test specific page
        const pageResponse = await fetch(`${baseUrl}/api/quran?action=mushaf&page=1`)
        
        if (pageResponse.ok) {
            const pageData = await pageResponse.json()
            console.log('✅ Mushaf Page API Success:')
            console.log(`   - Page: ${pageData.data.page}`)
            console.log(`   - Juz: ${pageData.data.juz}`)
            console.log(`   - Surah Info: ${pageData.data.surahInfo}`)
            console.log(`   - Ayat Range: ${pageData.data.ayatRange}`)
        } else {
            console.log(`❌ Mushaf Page API failed: ${pageResponse.status}`)
        }

        console.log('\n🎉 All Enhanced API Tests Completed!')
        console.log('\n🌐 Available Endpoints:')
        console.log(`   - Guru Santri: ${baseUrl}/api/guru/santri`)
        console.log(`   - Enhanced Ujian: ${baseUrl}/api/guru/ujian`)
        console.log(`   - Ujian Analytics: ${baseUrl}/api/analytics/ujian-analytics`)
        console.log(`   - Mushaf Digital: ${baseUrl}/api/quran?action=mushaf`)
        console.log(`   - Main App: ${baseUrl}`)

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\n💡 Make sure:')
        console.log('1. Development server is running (npm run dev)')
        console.log('2. Database is connected and seeded')
        console.log('3. All API routes are properly configured')
    }
}

// Run the test
testEnhancedUjianAPI().catch(console.error)