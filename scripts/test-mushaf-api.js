// Script untuk test Mushaf API
const API_URL = 'http://localhost:3001';

async function testMushafAPI() {
  console.log('🧪 Testing Mushaf API\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Get mushaf info
    console.log('\n📖 Test 1: Get Mushaf Info...');
    const infoResponse = await fetch(`${API_URL}/api/mushaf`);
    const infoData = await infoResponse.json();
    
    if (infoData.success) {
      console.log('✅ Mushaf Info Success!');
      console.log(`   Total Pages: ${infoData.data.totalPages}`);
      console.log(`   Total Juz: ${infoData.data.totalJuz}`);
    } else {
      console.log('❌ Mushaf Info Failed');
    }

    // Test 2: Get specific page (Page 1)
    console.log('\n📄 Test 2: Get Page 1...');
    const page1Response = await fetch(`${API_URL}/api/mushaf?page=1`);
    const page1Data = await page1Response.json();
    
    if (page1Data.success) {
      console.log('✅ Page 1 Success!');
      console.log(`   Page: ${page1Data.data.page}`);
      console.log(`   Juz: ${page1Data.data.juz}`);
      console.log(`   Surah: ${page1Data.data.surahInfo}`);
      console.log(`   Ayat Range: ${page1Data.data.ayatRange}`);
      console.log(`   Ayat Count: ${page1Data.data.pageInfo.ayatCount}`);
      console.log(`   Content Preview: ${page1Data.data.content.substring(0, 100)}...`);
    } else {
      console.log('❌ Page 1 Failed');
    }

    // Test 3: Get juz page range
    console.log('\n📚 Test 3: Get Juz 1 Page Range...');
    const juz1Response = await fetch(`${API_URL}/api/mushaf?juz=1`);
    const juz1Data = await juz1Response.json();
    
    if (juz1Data.success) {
      console.log('✅ Juz 1 Range Success!');
      console.log(`   Juz: ${juz1Data.data.juz}`);
      console.log(`   Page Range: ${juz1Data.data.pageRange.start}-${juz1Data.data.pageRange.end}`);
      console.log(`   Total Pages: ${juz1Data.data.totalPages}`);
      console.log(`   Surah: ${juz1Data.data.pageRange.surah}`);
    } else {
      console.log('❌ Juz 1 Range Failed');
    }

    // Test 4: Get mapping overview
    console.log('\n🗺️  Test 4: Get Juz Mapping...');
    const mappingResponse = await fetch(`${API_URL}/api/mushaf?action=mapping`);
    const mappingData = await mappingResponse.json();
    
    if (mappingData.success) {
      console.log('✅ Mapping Success!');
      console.log(`   Total Juz: ${mappingData.data.totalJuz}`);
      console.log(`   Total Pages: ${mappingData.data.totalPages}`);
      console.log('\n   Sample Juz Mapping:');
      mappingData.data.summary.slice(0, 5).forEach(juz => {
        console.log(`   Juz ${juz.juz}: Pages ${juz.pageRange} (${juz.totalPages} pages) - ${juz.surah}`);
      });
    } else {
      console.log('❌ Mapping Failed');
    }

    // Test 5: Test multiple pages
    console.log('\n📄 Test 5: Test Multiple Pages...');
    const testPages = [1, 22, 42, 100, 200, 300, 400, 500, 604];
    
    for (const pageNum of testPages) {
      const response = await fetch(`${API_URL}/api/mushaf?page=${pageNum}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Page ${pageNum}: Juz ${data.data.juz}, ${data.data.pageInfo.ayatCount} ayat`);
      } else {
        console.log(`   ❌ Page ${pageNum}: Failed`);
      }
    }

    // Test 6: Test all juz ranges
    console.log('\n📚 Test 6: Test All Juz Ranges...');
    let allJuzSuccess = true;
    
    for (let juzNum = 1; juzNum <= 30; juzNum++) {
      const response = await fetch(`${API_URL}/api/mushaf?juz=${juzNum}`);
      const data = await response.json();
      
      if (!data.success) {
        console.log(`   ❌ Juz ${juzNum}: Failed`);
        allJuzSuccess = false;
      }
    }
    
    if (allJuzSuccess) {
      console.log('   ✅ All 30 Juz ranges working!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Mushaf API Testing Complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testMushafAPI();
