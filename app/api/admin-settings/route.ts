import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { withAuth } from '@/lib/api-helpers';

// Default settings jika belum tersimpan di database
const defaultSettings = {
  whatsappNumber: '+6281213923253',
  whatsappMessageHelp: 'Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : \n\nterimakasih Atas bantuannya',
  whatsappMessageForgotPasscode: `🔑 *Passcode Baru Anda*

Halo *{nama}*,

Passcode baru Anda: *{passcode}*

Gunakan passcode ini untuk login.
Jangan bagikan ke orang lain.`
};

async function getStoredSettings() {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    const data = (setting?.data as Record<string, unknown>) || {};
    const stored: Record<string, unknown> = {};
    for (const key of Object.keys(defaultSettings)) {
      stored[key] = data[key] !== undefined && data[key] !== null ? data[key] : defaultSettings[key as keyof typeof defaultSettings];
    }
    return stored;
  } catch {
    return { ...defaultSettings };
  }
}

// GET - Ambil settings admin.
// Endpoint publik (mis. halaman forgot-passcode) hanya boleh melihat
// nomor WhatsApp admin + teks bantuan. Template passcode hanya untuk super_admin/admin.
export async function GET(request: NextRequest) {
  try {
    const settings = await getStoredSettings();

    const { user, error } = await withAuth(request, ['super_admin', 'admin']);

    if (error || !user) {
      return NextResponse.json({
        whatsappNumber: settings.whatsappNumber,
        whatsappMessageHelp: settings.whatsappMessageHelp,
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
    const { user, error } = await withAuth(request, ['super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageForgotPasscode
    } = body;

    if (!whatsappNumber || !whatsappMessageHelp || !whatsappMessageForgotPasscode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    const currentData = existing ? (existing.data as Record<string, unknown>) : {};

    await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: {
        data: {
          ...currentData,
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageForgotPasscode,
        } as any,
      },
      create: {
        id: "global",
        data: {
          ...currentData,
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageForgotPasscode,
        } as any,
      },
    });

    return NextResponse.json({ success: true, settings: await getStoredSettings() });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return NextResponse.json(
      { error: "Failed to update admin settings" },
      { status: 500 }
    );
  }
}

// DELETE - Reset settings ke default
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    const currentData = existing ? (existing.data as Record<string, unknown>) : {};

    const resetData: Record<string, unknown> = {};
    for (const key of Object.keys(defaultSettings)) {
      resetData[key] = defaultSettings[key as keyof typeof defaultSettings];
    }

    await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: { data: { ...currentData, ...resetData } as any },
      create: { id: "global", data: resetData as any },
    });

    return NextResponse.json({
      message: "Settings berhasil direset ke default",
      settings: await getStoredSettings()
    });
  } catch (error) {
    console.error("Error resetting admin settings:", error);
    return NextResponse.json(
      { error: "Failed to reset admin settings" },
      { status: 500 }
    );
  }
}
