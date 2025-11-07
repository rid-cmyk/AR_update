// Test script untuk logout functionality
const testLogout = async () => {
  console.log('🧪 Testing Logout Functionality...\n');

  try {
    // Test 1: Call logout API
    console.log('1️⃣ Testing logout API...');
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Logout API successful:', data);
    } else {
      console.log('❌ Logout API failed:', data);
    }

    // Test 2: Check cookie clearing
    console.log('\n2️⃣ Testing cookie clearing...');
    const cookies = response.headers.get('set-cookie');
    if (cookies && cookies.includes('auth_token=;')) {
      console.log('✅ Auth token cookie cleared successfully');
    } else {
      console.log('❌ Auth token cookie not cleared properly');
      console.log('Cookies:', cookies);
    }

    console.log('\n🎯 Logout test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testLogout();