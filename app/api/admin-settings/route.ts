import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Default settings data
const DEFAULT_SETTINGS = {
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

// GET - Ambil settings admin (Public - untuk halaman forgot-passcode juga)
export async function GET() {
  try {
    // Tidak perlu auth untuk GET karena digunakan di halaman public juga
    
    // Cari atau buat settings default
    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      // Buat settings default jika belum ada
      settings = await prisma.adminSettings.create({
        data: DEFAULT_SETTINGS
      });
    }

    return NextResponse.json(settings);
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
    console.log('PUT /api/admin-settings called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'null');
    console.log('Session user:', session?.user);
    
    if (!session?.user) {
      console.log('No session or user, returning 401');
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    // Check if user is super-admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });
    
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User role:', user?.role.name);

    if (!user || user.role.name !== "super-admin") {
      console.log('Not super-admin, returning 403');
      return NextResponse.json(
        { error: "Only super-admin can update settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageRegistered,
      whatsappMessageUnregistered
    } = body;

    // Validasi data
    if (!whatsappNumber || !whatsappMessageHelp || !whatsappMessageRegistered || !whatsappMessageUnregistered) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Cari settings yang ada
    let settings = await prisma.adminSettings.findFirst();
    console.log('Existing settings:', settings ? 'found' : 'not found');

    if (!settings) {
      // Buat baru jika belum ada
      console.log('Creating new settings');
      settings = await prisma.adminSettings.create({
        data: {
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageRegistered,
          whatsappMessageUnregistered
        }
      });
    } else {
      // Update yang sudah ada
      console.log('Updating existing settings');
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageRegistered,
          whatsappMessageUnregistered
        }
      });
    }

    console.log('Settings saved successfully');
    return NextResponse.json({ success: true, settings });
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super-admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (user?.role.name !== "super-admin") {
      return NextResponse.json(
        { error: "Only super-admin can reset settings" },
        { status: 403 }
      );
    }

    // Cari settings yang ada
    const settings = await prisma.adminSettings.findFirst();

    if (settings) {
      // Update ke default
      const resetSettings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: DEFAULT_SETTINGS
      });
      
      return NextResponse.json({
        message: "Settings berhasil direset ke default",
        settings: resetSettings
      });
    } else {
      // Buat baru dengan default
      const newSettings = await prisma.adminSettings.create({
        data: DEFAULT_SETTINGS
      });
      
      return NextResponse.json({
        message: "Settings default berhasil dibuat",
        settings: newSettings
      });
    }
  } catch (error) {
    console.error("Error resetting admin settings:", error);
    return NextResponse.json(
      { error: "Failed to reset admin settings" },
      { status: 500 }
    );
  }
}

