// Script untuk test login API
const API_URL = 'http://localhost:3001';

async function testLogin(passCode, expectedRole) {
  try {
    console.log(`\n🔐 Testing login with passCode: ${passCode}`);
    
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passCode }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Login successful!`);
      console.log(`   User: ${data.user.namaLengkap}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Expected: ${expectedRole}`);
      
      if (data.user.role === expectedRole) {
        console.log(`   ✓ Role matches!`);
        return true;
      } else {
        console.log(`   ✗ Role mismatch!`);
        return false;
      }
    } else {
      console.log(`❌ Login failed: ${data.error}`);
      console.log(`   Message: ${data.message || 'No message'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 Testing Login API for All Roles');
  console.log('='.repeat(60));

  // Test dengan passcode yang mungkin ada di database
  // Sesuaikan dengan data di database Anda
  const tests = [
    { passCode: '1234', expectedRole: 'admin' },
    { passCode: '5678', expectedRole: 'guru' },
    { passCode: '9999', expectedRole: 'santri' },
    // Tambahkan passcode lain sesuai database Anda
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testLogin(test.passCode, test.expectedRole);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Delay antar test
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
}

// Jalankan test
runTests().catch(console.error);
