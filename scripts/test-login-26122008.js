const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testing login with passcode: 26122008');

    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passCode: '26122008'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('- User ID:', data.user.id);
      console.log('- Name:', data.user.namaLengkap);
      console.log('- Username:', data.user.username);
      console.log('- Role:', data.user.role);
      console.log('- Message:', data.message);
    } else {
      console.log('❌ Login failed:');
      console.log('- Status:', response.status);
      console.log('- Error:', data.error);
      console.log('- Message:', data.message);
      console.log('- Code:', data.code);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogin();