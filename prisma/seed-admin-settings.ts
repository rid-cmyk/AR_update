import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminSettings() {
  console.log('🌱 Seeding Admin Settings...');

  // Check if settings already exist
  const existingSettings = await prisma.adminSettings.findFirst();

  if (existingSettings) {
    console.log('✅ Admin Settings already exist, skipping seed');
    return;
  }

  // Create default admin settings
  const settings = await prisma.adminSettings.create({
    data: {
      whatsappNumber: '+6281213923253',
      whatsappMessageHelp: 'Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : \n\nterimakasih Atas bantuannya',
      whatsappMessageRegistered: `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda di Aplikasi AR-Hafalan. Jaga kerahasiaan passcode Anda dan jangan berikan kepada siapapun.

Terima kasih atas partisipasinya dalam menggunakan Aplikasi AR-Hafalan.

Wassalamualaikum Warahmatullahi Wabarakatuh.`,
      whatsappMessageUnregistered: `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu melalui aplikasi atau hubungi admin untuk informasi lebih lanjut.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.`
    }
  });

  console.log('✅ Admin Settings created:', settings);
}

seedAdminSettings()
  .catch((e) => {
    console.error('❌ Error seeding admin settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
