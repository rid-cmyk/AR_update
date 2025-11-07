// Test the admin analytics APIs
const { default: fetch } = require('node-fetch')

async function testAdminAnalyticsAPI() {
    console.log('🧪 Testing Admin Analytics APIs...')
    
    const baseUrl = 'http://localhost:3001'
    
    try {
        // Test 1: Main Analytics Reports
        console.log('\n📊 Testing Main Analytics Reports...')
        const reportsResponse = await fetch(`${baseUrl}/api/analytics/reports?startDate=2024-01-01&endDate=2024-12-31`)
        const reportsResult = await reportsResponse.json()
        
        console.log('Reports Response Status:', reportsResponse.status)
        if (reportsResult.success) {
            console.log('✅ Main Analytics Reports Success')
            console.log('📈 Summary Data:', {
                totalHalaqah: reportsResult.data.summary?.totalHalaqah || 0,
                totalSantri: reportsResult.data.summary?.totalSantri || 0,
                totalGuru: reportsResult.data.summary?.totalGuru || 0,
                overallAttendance: reportsResult.data.summary?.overallAttendance || 0
            })
            
            console.log('📋 Reports Available:', {
                halaqahReports: reportsResult.data.halaqahReports?.length || 0,
                santriReports: reportsResult.data.santriReports?.length || 0,
                guruReports: reportsResult.data.guruReports?.length || 0
            })
        } else {
            console.log('❌ Main Analytics Reports Failed:', reportsResult.message)
        }

        // Test 2: Ujian Reports
        console.log('\n📝 Testing Ujian Reports...')
        const ujianResponse = await fetch(`${baseUrl}/api/analytics/ujian-reports?startDate=2024-01-01&endDate=2024-12-31`)
        const ujianResult = await ujianResponse.json()
        
        console.log('Ujian Response Status:', ujianResponse.status)
        if (ujianResult.success) {
            console.log('✅ Ujian Reports Success')
            console.log('📊 Ujian Data:', {
                totalUjian: ujianResult.metadata?.totalUjian || 0,
                totalTarget: ujianResult.metadata?.totalTarget || 0
            })
            
            if (ujianResult.data.ujianReports && ujianResult.data.ujianReports.length > 0) {
                console.log('📝 Sample Ujian:', {
                    santri: ujianResult.data.ujianReports[0].santri,
                    jenisUjian: ujianResult.data.ujianReports[0].jenisUjian,
                    nilaiAkhir: ujianResult.data.ujianReports[0].nilaiAkhir
                })
            }
        } else {
            console.log('❌ Ujian Reports Failed:', ujianResult.message)
        }

        // Test 3: Tahfidz Reports
        console.log('\n📚 Testing Tahfidz Reports...')
        const tahfidzResponse = await fetch(`${baseUrl}/api/analytics/tahfidz-reports?semester=S1&tahunAjaran=2024/2025`)
        const tahfidzResult = await tahfidzResponse.json()
        
        console.log('Tahfidz Response Status:', tahfidzResponse.status)
        if (tahfidzResult.success) {
            console.log('✅ Tahfidz Reports Success')
            console.log('📈 Tahfidz Summary:', {
                totalSantri: tahfidzResult.data.summary?.totalSantri || 0,
                averageNilai: tahfidzResult.data.summary?.averageNilai || 0,
                averageKehadiran: tahfidzResult.data.summary?.averageKehadiran || 0,
                totalHafalan: tahfidzResult.data.summary?.totalHafalan || 0
            })
            
            if (tahfidzResult.data.reports && tahfidzResult.data.reports.length > 0) {
                console.log('👤 Sample Santri Report:', {
                    nama: tahfidzResult.data.reports[0].namaSantri,
                    halaqah: tahfidzResult.data.reports[0].halaqah,
                    nilaiAkhir: tahfidzResult.data.reports[0].nilaiAkhir,
                    statusAkhir: tahfidzResult.data.reports[0].statusAkhir
                })
            }
        } else {
            console.log('❌ Tahfidz Reports Failed:', tahfidzResult.message)
        }

        // Test 4: Different Date Ranges
        console.log('\n📅 Testing Different Date Ranges...')
        const monthlyResponse = await fetch(`${baseUrl}/api/analytics/reports?startDate=2024-11-01&endDate=2024-11-30`)
        const monthlyResult = await monthlyResponse.json()
        
        console.log('Monthly Response Status:', monthlyResponse.status)
        if (monthlyResult.success) {
            console.log('✅ Monthly Reports Success')
            console.log('📊 Monthly Summary:', monthlyResult.data.summary)
        }

        // Test 5: Different Semesters
        console.log('\n🎓 Testing Different Semesters...')
        const s2Response = await fetch(`${baseUrl}/api/analytics/tahfidz-reports?semester=S2&tahunAjaran=2024/2025`)
        const s2Result = await s2Response.json()
        
        console.log('S2 Response Status:', s2Response.status)
        if (s2Result.success) {
            console.log('✅ S2 Reports Success')
            console.log('📈 S2 Summary:', s2Result.data.summary)
        }

        console.log('\n🎉 Admin Analytics API Test Complete!')
        console.log('\n🌐 Available Analytics Endpoints:')
        console.log('   📊 Main Reports: /api/analytics/reports')
        console.log('   📝 Ujian Reports: /api/analytics/ujian-reports')
        console.log('   📚 Tahfidz Reports: /api/analytics/tahfidz-reports')
        
        console.log('\n🔧 Available Parameters:')
        console.log('   📅 startDate & endDate: YYYY-MM-DD format')
        console.log('   🎓 semester: S1 or S2')
        console.log('   📚 tahunAjaran: YYYY/YYYY format')
        
    } catch (error) {
        console.error('❌ Error testing Admin Analytics API:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testAdminAnalyticsAPI().catch(console.error)