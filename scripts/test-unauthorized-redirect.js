// Test script untuk unauthorized redirect
const testUnauthorizedRedirect = async () => {
  console.log('🧪 Testing Unauthorized Redirect...\n');

  try {
    // Test 1: Access protected route without auth
    console.log('1️⃣ Testing access to protected route without auth...');
    const response1 = await fetch('http://localhost:3000/admin/dashboard', {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects automatically
    });

    console.log('Response status:', response1.status);
    console.log('Response headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.status === 302 || response1.status === 307) {
      const location = response1.headers.get('location');
      console.log('✅ Redirect detected to:', location);
      
      if (location && location.includes('/login')) {
        console.log('✅ Correctly redirected to login (no token)');
      } else if (location && location.includes('/unauthorized')) {
        console.log('✅ Correctly redirected to unauthorized');
      } else {
        console.log('❌ Unexpected redirect location');
      }
    } else {
      console.log('❌ No redirect detected');
    }

    // Test 2: Access unauthorized page directly
    console.log('\n2️⃣ Testing direct access to unauthorized page...');
    const response2 = await fetch('http://localhost:3000/unauthorized', {
      method: 'GET'
    });

    if (response2.ok) {
      console.log('✅ Unauthorized page accessible');
      console.log('Response status:', response2.status);
    } else {
      console.log('❌ Unauthorized page not accessible');
      console.log('Response status:', response2.status);
    }

    console.log('\n🎯 Unauthorized redirect test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testUnauthorizedRedirect();