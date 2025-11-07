// Test script untuk memverifikasi fungsi login
const fetch = require('node-fetch');

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');
  
  // Test cases dengan berbagai role
  const testCases = [
    { passCode: '1234567890', expectedRole: 'super_admin', description: 'Super Admin Login' },
    { passCode: '0987654321', expectedRole: 'admin', description: 'Admin Login' },
    { passCode: '1111111111', expectedRole: 'guru', description: 'Guru Login' },
    { passCode: '2222222222', expectedRole: 'santri', description: 'Santri Login' },
    { passCode: '3333333333', expectedRole: 'ortu', description: 'Ortu Login' },
    { passCode: '4444444444', expectedRole: 'yayasan', description: 'Yayasan Login' },
    { passCode: 'wrongcode', expectedRole: null, description: 'Invalid Passcode' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.description}`);
    console.log(`🔑 Passcode: ${testCase.passCode}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passCode: testCase.passCode }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Login Success!`);
        console.log(`👤 User: ${data.user.namaLengkap}`);
        console.log(`🎭 Role: ${data.user.role}`);
        console.log(`🏠 Expected Dashboard: /${data.user.role.replace('_', '-')}/dashboard`);
        
        if (testCase.expectedRole && data.user.role === testCase.expectedRole) {
          console.log(`✅ Role matches expected: ${testCase.expectedRole}`);
        } else if (testCase.expectedRole) {
          console.log(`❌ Role mismatch! Expected: ${testCase.expectedRole}, Got: ${data.user.role}`);
        }
      } else {
        console.log(`❌ Login Failed: ${data.error || data.message}`);
        if (testCase.expectedRole === null) {
          console.log(`✅ Expected failure for invalid passcode`);
        }
      }
    } catch (error) {
      console.log(`💥 Network Error: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('- Valid passcodes should return user data with role');
  console.log('- Invalid passcodes should return error');
  console.log('- Each role should redirect to appropriate dashboard');
  console.log('- JWT token should be set in HTTP-only cookie');
}

// Run test if this file is executed directly
if (require.main === module) {
  testLogin().catch(console.error);
}

module.exports = { testLogin };