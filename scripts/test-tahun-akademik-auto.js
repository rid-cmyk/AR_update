// Test script untuk sistem tahun akademik otomatis
const testTahunAkademikAuto = async () => {
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
      console.log('Preview data:', JSON.stringify(previewData.data.summary, null, 2));
    } else {
      console.log('❌ Preview failed:', previewData.error);
    }

    // Test 2: Get current tahun akademik
    console.log('\n2️⃣ Testing current tahun akademik detection...');
    const currentResponse = await fetch('http://localhost:3000/api/admin/tahun-a