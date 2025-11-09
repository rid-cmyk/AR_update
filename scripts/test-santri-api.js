// Script untuk test API santri
const API_URL = 'http://localhost:3001';

async function testSantriAPI() {
  try {
    console.log('🧪 Testing /api/guru/santri endpoint...\n');
    
    const response = await fetch(`${API_URL}/api/guru/santri`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ API Response Success!');
      console.log('Status:', response.status);
      console.log('\n📊 Summary:');
      console.log('  - Total Santri:', data.data?.santriList?.length || 0);
      console.log('  - Total Halaqah:', data.data?.summary?.totalHalaqah || 0);
      
      console.log('\n👥 Santri List:');
      if (data.data?.santriList) {
        data.data.santriList.forEach((santri, index) => {
          console.log(`  ${index + 1}. ${santri.namaLengkap} (${santri.username})`);
          console.log(`     Halaqah: ${santri.halaqah?.namaHalaqah || 'N/A'}`);
          console.log(`     Guru: ${santri.halaqah?.guru?.namaLengkap || 'N/A'}`);
        });
      }

      console.log('\n🏛️ By Halaqah:');
      if (data.data?.byHalaqah) {
        Object.entries(data.data.byHalaqah).forEach(([halaqahName, halaqahData]) => {
          console.log(`  - ${halaqahName}: ${halaqahData.santri.length} santri`);
        });
      }

      return true;
    } else {
      console.log('❌ API Response Failed!');
      console.log('Status:', response.status);
      console.log('Error:', data.message || data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Run test
testSantriAPI().then(success => {
  console.log('\n' + '='.repeat(60));
  console.log(success ? '✅ Test PASSED' : '❌ Test FAILED');
  console.log('='.repeat(60));
});
