// Script untuk membuat sample data forgot passcode notifications
// Jalankan dengan: node scripts/create-sample-forgot-passcode.js

const sampleRequests = [
  {
    phoneNumber: "08123456789",
    message: "Saya lupa passcode, mohon bantuan reset"
  },
  {
    phoneNumber: "08987654321", 
    message: "Tolong reset passcode saya"
  },
  {
    phoneNumber: "08111222333",
    message: "Passcode tidak bisa digunakan"
  },
  {
    phoneNumber: "08999888777", // Nomor tidak terdaftar
    message: "Saya ingin bergabung tapi lupa passcode"
  },
  {
    phoneNumber: "08555444333", // Nomor tidak terdaftar
    message: null // Tanpa pesan
  }
];

async function createSampleData() {
  console.log('🔄 Creating sample forgot passcode notifications...');
  
  for (let i = 0; i < sampleRequests.length; i++) {
    const request = sampleRequests[i];
    
    try {
      const response = await fetch('http://localhost:3000/api/forgot-passcode/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Created notification for ${request.phoneNumber}:`, result.isRegistered ? 'Registered' : 'Not Registered');
      } else {
        console.log(`❌ Failed to create notification for ${request.phoneNumber}:`, result.error);
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error creating notification for ${request.phoneNumber}:`, error.message);
    }
  }
  
  console.log('✅ Sample data creation completed!');
  console.log('📱 Check the super-admin dashboard for notifications');
}

// Run the script
createSampleData().catch(console.error);