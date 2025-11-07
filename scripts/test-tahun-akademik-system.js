// Test script untuk sistem tahun akademik otomatis
const testTahunAkademikSystem = async () => {
  console.log('🧪 Testing Tahun Akademik Auto System...\n');

  try {
    // Test 1: Preview auto-generate
    console.log('1️⃣ Testing preview auto-generate...');
    const previewResponse = await fetch('http://localhost:3000/api/admin/tahun-akademik/auto-generate?startYear=2024&endYear=2025', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const previewData = await previewResponse.json();
    
    if (previewResponse.ok && previewData.success) {
      console.log('✅ Preview successful');
      console.log('Preview summary:', JSON.stringify(previewData.data.summary, null, 2));
      console.log('Will create:', previewData.data.preview.filter(p => !p.exists).length, 'tahun akademik');
    } else {
      console.log('❌ Preview failed:', previewData.error);
    }

    // Test 2: Get active tahun akademik
    console.log('\n2️⃣ Testing active tahun akademik...');
    const activeResponse = await fetch('http://localhost:3000/api/admin/tahun-akademik/active', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const activeData = await activeResponse.json();
    
    if (activeResponse.ok && activeData.success) {
      console.log('✅ Active tahun akademik retrieved');
      if (activeData.data.active) {
        console.log('Active:', activeData.data.active.namaLengkap);
      } else {
        console.log('No active tahun akademik found');
      }
      console.log('Current system:', activeData.data.current.namaLengkap);
    } else {
      console.log('❌ Failed to get active tahun akademik:', activeData.error);
    }

    // Test 3: Test utility functions
    console.log('\n3️⃣ Testing utility functions...');
    
    // Simulate current date scenarios
    const testDates = [
      new Date('2024-01-15'), // Semester 2
      new Date('2024-07-15'), // Semester 1
      new Date('2024-12-15'), // Semester 1
      new Date('2025-03-15'), // Semester 2
    ];

    testDates.forEach(date => {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      let expectedSemester, expectedTahunMulai, expectedTahunSelesai;
      
      if (month >= 1 && month <= 6) {
        // Januari - Juni = Semester 2
        expectedSemester = 'S2';
        expectedTahunMulai = year - 1;
        expectedTahunSelesai = year;
      } else {
        // Juli - Desember = Semester 1
        expectedSemester = 'S1';
        expectedTahunMulai = year;
        expectedTahunSelesai = year + 1;
      }
      
      console.log(`Date: ${date.toISOString().split('T')[0]} -> ${expectedTahunMulai}/${expectedTahunSelesai} ${expectedSemester}`);
    });

    console.log('\n🎯 Tahun Akademik system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testTahunAkademikSystem();