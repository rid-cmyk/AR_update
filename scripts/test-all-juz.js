// Script untuk test semua 30 juz dari API equran.id
const API_URL = 'http://localhost:3001';

async function testAllJuz() {
  console.log('🧪 Testing All 30 Juz from Equran.id API\n');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (let juz = 1; juz <= 30; juz++) {
    try {
      const response = await fetch(`${API_URL}/api/quran/juz/${juz}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.surat) {
          const totalAyat = data.data.surat.reduce((sum, surat) => sum + surat.ayat.length, 0);
          const suratNames = data.data.surat.map(s => s.namaLatin).join(', ');
          
          results.push({
            juz,
            status: '✅',
            suratCount: data.data.surat.length,
            ayatCount: totalAyat,
            suratNames: suratNames.length > 50 ? suratNames.substring(0, 50) + '...' : suratNames
          });
          
          successCount++;
        } else {
          results.push({
            juz,
            status: '❌',
            error: 'Invalid data structure'
          });
          failCount++;
        }
      } else {
        results.push({
          juz,
          status: '❌',
          error: `HTTP ${response.status}`
        });
        failCount++;
      }
    } catch (error) {
      results.push({
        juz,
        status: '❌',
        error: error.message
      });
      failCount++;
    }
  }

  console.log('\n📊 Test Results:\n');
  console.log('Juz | Status | Surat | Ayat | Surat Names');
  console.log('-'.repeat(60));
  
  results.forEach(result => {
    if (result.status === '✅') {
      console.log(
        `${String(result.juz).padStart(3)} | ${result.status}    | ${String(result.suratCount).padStart(5)} | ${String(result.ayatCount).padStart(4)} | ${result.suratNames}`
      );
    } else {
      console.log(
        `${String(result.juz).padStart(3)} | ${result.status}    | Error: ${result.error}`
      );
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Success: ${successCount}/30`);
  console.log(`❌ Failed: ${failCount}/30`);
  console.log(`📈 Success Rate: ${((successCount / 30) * 100).toFixed(1)}%\n`);

  if (successCount === 30) {
    console.log('🎉 All 30 Juz are working perfectly!');
    console.log('✨ Mushaf Digital is ready to display the complete Quran!\n');
  } else {
    console.log('⚠️  Some juz failed. Please check the errors above.\n');
  }
}

testAllJuz();
