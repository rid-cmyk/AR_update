import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testAPI(endpoint, method = 'GET', body = null) {
    try {
        console.log(`\n🧪 Testing ${method} ${endpoint}`);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Success: ${data.success}`);
        console.log(`Message: ${data.message || 'No message'}`);
        
        if (data.success) {
            console.log('✅ API OK');
            if (data.data) {
                if (Array.isArray(data.data)) {
                    console.log(`📊 Data count: ${data.data.length}`);
                } else if (data.data.santriList) {
                    console.log(`👥 Santri count: ${data.data.santriList.length}`);
                }
            }
        } else {
            console.log('❌ API Error');
            console.log('Error details:', data.error || data.message);
        }
        
        return { success: data.success, data: data.data };
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests for Ujian System\n');
    
    // Test 1: Santri API
    const santriResult = await testAPI('/api/guru/santri');
    
    // Test 2: Jenis Ujian API
    const jenisUjianResult = await testAPI('/api/admin/jenis-ujian');
    
    // Test 3: Ujian API (GET)
    const ujianGetResult = await testAPI('/api/guru/ujian');
    
    // Test 4: Create Ujian (POST)
    if (santriResult.success && jenisUjianResult.success) {
        const sampleUjianData = {
            jenisUjian: {
                nama: "Test Ujian Tasmi'",
                tipeUjian: "per-juz"
            },
            juzRange: {
                dari: 1,
                sampai: 2
            },
            ujianResults: [{
                santriId: "test-santri-1",
                nilaiDetail: {
                    "juz-1": 85,
                    "juz-2": 90
                },
                nilaiAkhir: 87.5,
                catatan: "Test ujian dari script"
            }],
            metadata: {
                testMode: true,
                timestamp: new Date().toISOString()
            }
        };
        
        await testAPI('/api/guru/ujian', 'POST', sampleUjianData);
    }
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);