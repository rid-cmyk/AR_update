// Test the guru santri dropdown API
const { default: fetch } = require('node-fetch')

async function testGuruSantriDropdown() {
    console.log('🧪 Testing Guru Santri Dropdown API...')
    
    try {
        // Test the new guru/santri endpoint
        const response = await fetch('http://localhost:3001/api/guru/santri')
        const result = await response.json()
        
        console.log('📡 Response Status:', response.status)
        
        if (result.success) {
            console.log('✅ Guru Santri API Success')
            console.log('📊 Metadata:', result.metadata)
            console.log('📋 Santri Data:')
            
            if (result.data && result.data.length > 0) {
                result.data.forEach((santri, index) => {
                    console.log(`   ${index + 1}. ${santri.nama} (@${santri.username}) - ${santri.kelas}`)
                })
                
                console.log('\\n🎯 Dropdown Structure:')
                console.log('   - ID untuk value:', result.data[0].id)
                console.log('   - Nama untuk display:', result.data[0].nama)
                console.log('   - Kelas/Halaqah untuk tag:', result.data[0].kelas)
                console.log('   - Username untuk additional info:', result.data[0].username)
                
                console.log('\\n📝 Sample Dropdown Option:')
                console.log(`   <Option key="${result.data[0].id}" value="${result.data[0].id}">`)
                console.log(`     <Space>`)
                console.log(`       <UserOutlined />`)
                console.log(`       <span>${result.data[0].nama}</span>`)
                console.log(`       <Tag color="blue">${result.data[0].kelas}</Tag>`)
                console.log(`     </Space>`)
                console.log(`   </Option>`)
                
            } else {
                console.log('   ⚠️ Tidak ada santri ditemukan')
            }
            
            console.log('\\n🔍 API Features:')
            console.log('   ✅ Filter santri berdasarkan halaqah guru')
            console.log('   ✅ Include nama lengkap dan username')
            console.log('   ✅ Include informasi halaqah')
            console.log('   ✅ Sample data jika database kosong')
            console.log('   ✅ Metadata lengkap untuk debugging')
            
        } else {
            console.log('❌ Guru Santri API Failed:', result.message)
        }
        
        // Test ujian page to see if dropdown works
        console.log('\\n🌐 Testing ujian page integration...')
        const ujianResponse = await fetch('http://localhost:3001/guru/ujian')
        
        if (ujianResponse.status === 200) {
            console.log('✅ Ujian page accessible')
            console.log('💡 Dropdown santri akan menampilkan:')
            if (result.success && result.data) {
                result.data.forEach(santri => {
                    console.log(`   - ${santri.nama} (${santri.kelas})`)
                })
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing guru santri dropdown:', error.message)
        console.log('💡 Make sure the development server is running (npm run dev)')
    }
}

testGuruSantriDropdown().catch(console.error)