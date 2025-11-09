// Script untuk test API santri dengan authentication
const API_URL = 'http://localhost:3001';

async function loginAsGuru() {
  try {
    console.log('🔐 Logging in as Guru (Ustadz Ahmad)...');
    
    // Login dengan passcode guru
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        passCode: 'guru01' // Passcode untuk Ustadz Ahmad
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('   User:', data.user.namaLengkap);
      console.log('   Role:', data.user.role);
      
      // Get cookie from response
      const cookies = response.headers.get('set-cookie');
      return cookies;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testSantriAPIWithAuth(cookies) {
  try {
    console.log('\n🧪 Testing /api/guru/santri with authentication...\n');
    
    const response = await fetch(`${API_URL}/api/guru/santri`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    const data = await response.json();

    if (response.ok) {
      console.log('✅ API Response Success!');
      console.log('Status:', response.status);
      console.log('Message:', data.message);
      
      console.log('\n📊 Summary:');
      console.log('  - Total Santri:', data.data?.santriList?.length || 0);
      console.log('  - Total Halaqah:', data.data?.summary?.totalHalaqah || 0);
      
      console.log('\n🏛️ Halaqah yang Diajar:');
      if (data.data?.halaqahList) {
        data.data.halaqahList.forEach((halaqah) => {
          console.log(`  - ${halaqah.namaHalaqah} (Guru: ${halaqah.guru?.namaLengkap || 'N/A'})`);
        });
      }
      
      console.log('\n👥 Santri List:');
      if (data.data?.santriList) {
        data.data.santriList.forEach((santri, index) => {
          console.log(`  ${index + 1}. ${santri.namaLengkap} (${santri.username})`);
          console.log(`     Halaqah: ${santri.halaqah?.namaHalaqah || 'N/A'}`);
          console.log(`     Tahun: ${santri.tahunAkademik} - ${santri.semester}`);
        });
      }

      console.log('\n📈 Per Halaqah:');
      if (data.data?.summary?.santriPerHalaqah) {
        data.data.summary.santriPerHalaqah.forEach((item) => {
          console.log(`  - ${item.halaqah}: ${item.jumlahSantri} santri (Guru: ${item.guru})`);
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
async function runTest() {
  console.log('='.repeat(60));
  console.log('🧪 Testing Guru Santri API with Authentication');
  console.log('='.repeat(60) + '\n');

  const cookies = await loginAsGuru();
  
  if (!cookies) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  const success = await testSantriAPIWithAuth(cookies);

  console.log('\n' + '='.repeat(60));
  console.log(success ? '✅ Test PASSED' : '❌ Test FAILED');
  console.log('='.repeat(60));
}

runTest();
