// Script untuk test API equran.id integration
const API_URL = 'http://localhost:3001';

async function testEquranAPI() {
  console.log('🧪 Testing Equran.id API Integration\n');

  try {
    // Test 1: Get Surat Al-Fatihah
    console.log('1. Testing Surat API (Al-Fatihah)...');
    const suratResponse = await fetch(`${API_URL}/api/quran/surat/1`);
    const suratData = await suratResponse.json();
    
    if (suratData.success) {
      console.log('✅ Surat API Success!');
      console.log(`   Surat: ${suratData.data.namaLatin} (${suratData.data.nama})`);
      console.log(`   Jumlah Ayat: ${suratData.data.jumlahAyat}`);
      console.log(`   First Ayat: ${suratData.data.ayat[0].teksArab}`);
    } else {
      console.log('❌ Surat API Failed:', suratData.message);
    }

    console.log('\n2. Testing Juz API (Juz 1)...');
    const juzResponse = await fetch(`${API_URL}/api/quran/juz/1`);
    const juzData = await juzResponse.json();
    
    if (juzData.success) {
      console.log('✅ Juz API Success!');
      console.log(`   Juz: ${juzData.data.juz}`);
      console.log(`   Jumlah Surat: ${juzData.data.surat.length}`);
      juzData.data.surat.forEach((surat, index) => {
        console.log(`   ${index + 1}. ${surat.namaLatin} (${surat.ayat.length} ayat)`);
      });
    } else {
      console.log('❌ Juz API Failed:', juzData.message);
    }

    console.log('\n3. Testing Multiple Juz...');
    for (let juz = 1; juz <= 3; juz++) {
      const response = await fetch(`${API_URL}/api/quran/juz/${juz}`);
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Juz ${juz}: ${data.data.surat.length} surat`);
      } else {
        console.log(`   ❌ Juz ${juz}: Failed`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEquranAPI();
