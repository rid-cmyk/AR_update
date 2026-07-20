import { NextRequest, NextResponse } from "next/server";

// In-memory settings store (since adminSettings is not in Prisma schema)
// In production, add AdminSettings model to Prisma schema
let currentSettings = {
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
};

// GET - Ambil settings admin (Public)
export async function GET() {
  try {
    return NextResponse.json(currentSettings);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings admin
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageRegistered,
      whatsappMessageUnregistered
    } = body;

    if (!whatsappNumber || !whatsappMessageHelp || !whatsappMessageRegistered || !whatsappMessageUnregistered) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    currentSettings = {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageRegistered,
      whatsappMessageUnregistered
    };

    return NextResponse.json({ success: true, settings: currentSettings });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return NextResponse.json(
      { error: "Failed to update admin settings", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Reset settings ke default
export async function DELETE() {
  try {
    currentSettings = {
      whatsappNumber: '+6281213923253',
      whatsappMessageHelp: 'Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : \n\nterimakasih Atas bantuannya',
      whatsappMessageRegistered: `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda di Aplikasi AR-Hafalan.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.`,
      whatsappMessageUnregistered: `Assalamualaikum Warahmatullahi Wabarakatuh,

Maaf, nomor {nomor} belum terdaftar.

Wassalamualaikum Warahmatullahi Wabarakatuh.`
    };

    return NextResponse.json({
      message: "Settings berhasil direset ke default",
      settings: currentSettings
    });
  } catch (error) {
    console.error("Error resetting admin settings:", error);
    return NextResponse.json(
      { error: "Failed to reset admin settings" },
      { status: 500 }
    );
  }
}
