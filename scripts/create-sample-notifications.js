const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleNotifications() {
  try {
    console.log('Creating sample forgot passcode notifications...');

    // Create some sample notifications
    const sampleNotifications = [
      {
        phoneNumber: '081234567890',
        message: 'Lupa passcode, mohon bantuan reset',
        isRegistered: false,
        userId: null,
      },
      {
        phoneNumber: '081987654321',
        message: 'Tidak bisa login, lupa passcode',
        isRegistered: false,
        userId: null,
      },
      {
        phoneNumber: '081555666777',
        message: 'Butuh reset passcode segera',
        isRegistered: false,
        userId: null,
      },
      {
        phoneNumber: '081999888777',
        message: 'Passcode tidak berfungsi',
        isRegistered: false,
        userId: null,
      }
    ];

    for (const notification of sampleNotifications) {
      await prisma.forgotPasscode.create({
        data: notification
      });
    }

    console.log('Sample notifications created successfully!');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotifications();