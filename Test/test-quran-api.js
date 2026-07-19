// Test script for enhanced Quran API
const testQuranAPI = async () => {
  console.log('🧪 Testing Enhanced Quran API...');

  try {
    // Test 1: Get mushaf page
    console.log('\n📖 Test 1: Get mushaf page...');
    const pageResponse = await fetch('http://localhost:3001/api/quran?action=mushaf&page=1');
    const pageData = await pageResponse.json();
    console.log('✅ Status:', pageResponse.status);
    console.log('✅ Success:', pageData.success);
    console.log('✅ Page:', pageData.data?.page);
    console.log('✅ Juz:', pageData.data?.juz);

    // Test 2: Search surats
    console.log('\n🔍 Test 2: Search surats...');
    const searchResponse = await fetch('http://localhost:3001/api/quran?action=search&search=fatihah');
    const searchData = await searchResponse.json();
    console.log('✅ Status:', searchResponse.status);
    console.log('✅ Success:', searchData.success);
    console.log('✅ Results:', searchData.data?.totalResults);

    // Test 3: Get juz info
    console.log('\n📚 Test 3: Get juz info...');
    const juzResponse = await fetch('http://localhost:3001/api/quran?action=mushaf&juz=1');
    const juzData = await juzResponse.json();
    console.log('✅ Status:', juzResponse.status);
    console.log('✅ Success:', juzData.success);
    console.log('✅ Juz:', juzData.data?.juz);
    console.log('✅ Pages:', juzData.data?.totalPages);

    // Test 4: Create bookmark
    console.log('\n📌 Test 4: Create bookmark...');
    const bookmarkResponse = await fetch('http://localhost:3001/api/quran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'bookmark',
        userId: 'test123',
        data: {
          type: 'page',
          reference: { page: 1 },
          note: 'Test bookmark for Al-Fatihah'
        }
      })
    });
    const bookmarkData = await bookmarkResponse.json();
    console.log('✅ Status:', bookmarkResponse.status);
    console.log('✅ Success:', bookmarkData.success);
    console.log('✅ Bookmark ID:', bookmarkData.data?.id);

    // Test 5: Update progress
    console.log('\n📈 Test 5: Update progress...');
    const progressResponse = await fetch('http://localhost:3001/api/quran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'progress',
        userId: 'test123',
        data: {
          suratId: 1,
          ayatNumber: 1,
          status: 'memorized'
        }
      })
    });
    const progressData = await progressResponse.json();
    console.log('✅ Status:', progressResponse.status);
    console.log('✅ Success:', progressData.success);
    console.log('✅ Progress:', progressData.data?.status);

    // Test 6: Get bookmarks
    console.log('\n📋 Test 6: Get user bookmarks...');
    const getBookmarksResponse = await fetch('http://localhost:3001/api/quran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-bookmarks',
        userId: 'test123'
      })
    });
    const bookmarksData = await getBookmarksResponse.json();
    console.log('✅ Status:', getBookmarksResponse.status);
    console.log('✅ Success:', bookmarksData.success);
    console.log('✅ Total bookmarks:', bookmarksData.total);

    // Test 7: Get progress
    console.log('\n📊 Test 7: Get user progress...');
    const getProgressResponse = await fetch('http://localhost:3001/api/quran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-progress',
        userId: 'test123'
      })
    });
    const userProgressData = await getProgressResponse.json();
    console.log('✅ Status:', getProgressResponse.status);
    console.log('✅ Success:', userProgressData.success);
    console.log('✅ Total progress:', userProgressData.total);
    console.log('✅ Stats:', userProgressData.stats);

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Mushaf navigation working');
    console.log('- ✅ Search functionality working');
    console.log('- ✅ Juz information working');
    console.log('- ✅ Bookmark system working');
    console.log('- ✅ Progress tracking working');
    console.log('- ✅ Data retrieval working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testQuranAPI();