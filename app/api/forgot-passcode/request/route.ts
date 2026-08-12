import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { notifyForgotPasscode } from "@/lib/services/whatsapp-notifier";
import {
  checkForgotPasscodeCooldown,
  recordForgotPasscodeAttempt,
  resetForgotPasscodeAttempts,
} from "@/lib/utils/forgotPasscodeCooldown";

// Generate passcode 8 karakter alfanumerik, pastikan unik & beda dari passcode lama.
async function generateUniquePasscode(excludeCurrentPassCode?: string): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    const existing = await prisma.user.findFirst({
      where: {
        passCode: candidate,
        ...(excludeCurrentPassCode ? { NOT: { passCode: excludeCurrentPassCode } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
  }
  // Fallback dengan timestamp suffix agar tetap unik
  return `P${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = (request.headers.get("x-forwarded-for") || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return forwardedFor.length > 0
    ? forwardedFor[forwardedFor.length - 1]
    : request.headers.get("x-real-ip") || "unknown";
};

// POST - Reset passcode otomatis dari form publik
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Nomor telepon harus diisi' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json(
        { error: 'Format nomor telepon tidak valid' },
        { status: 400 }
      );
    }

    // Cooldown anti-spam per nomor + IP
    const cooldownKey = `${cleanPhone.slice(-10)}|${getClientIp(request)}`;
    const cooldownStatus = checkForgotPasscodeCooldown(cooldownKey);
    if (cooldownStatus.locked) {
      const menit = Math.ceil(cooldownStatus.remainingMs / 60000);
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan. Silakan coba lagi.',
          message: `Batas percobaan terlampaui. Silakan tunggu ${menit} menit sebelum mencoba lagi.`,
          remainingMs: cooldownStatus.remainingMs,
        },
        { status: 429 }
      );
    }

    // Check if phone number is registered in system
    const user = await prisma.user.findFirst({
      where: {
        noTlp: {
          contains: cleanPhone.slice(-10) // Check last 10 digits
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        noTlp: true,
        passCode: true
      }
    });

    if (user) {
      // Reset passcode otomatis
      const newPasscode = await generateUniquePasscode(user.passCode || undefined);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { passCode: newPasscode },
        select: { id: true, namaLengkap: true, username: true }
      });

      // Audit trail
      await prisma.forgotPasscode.create({
        data: {
          phoneNumber: phoneNumber,
          message: message || 'Passcode direset otomatis melalui form',
          isRegistered: true,
          userId: user.id,
          isRead: true
        }
      });

      // Kirim WA (await agar halaman bisa memberi info jika gagal)
      let waSent = false;
      try {
        waSent = await notifyForgotPasscode(user.id, newPasscode);
      } catch (error) {
        console.error('Error sending forgot passcode WhatsApp:', error);
        waSent = false;
      }

      // Reset cooldown hanya jika WA berhasil terkirim (reset sukses)
      if (waSent) {
        resetForgotPasscodeAttempts(cooldownKey);
      }

      return NextResponse.json({
        success: true,
        message: waSent
          ? 'Passcode baru telah dikirim via WhatsApp. Silakan cek pesan masuk Anda.'
          : 'Passcode Anda telah direset. Jika tidak menerima pesan WhatsApp, hubungi admin untuk bantuan.',
        isRegistered: true,
        waSent,
        user: {
          namaLengkap: updatedUser.namaLengkap,
          username: updatedUser.username
        }
      });
    }

    // Nomor tidak terdaftar — tetap catat sebagai percobaan (anti-spam)
    recordForgotPasscodeAttempt(cooldownKey);

    await prisma.forgotPasscode.create({
      data: {
        phoneNumber: phoneNumber,
        message: message || 'Permintaan reset passcode melalui form',
        isRegistered: false,
        userId: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Nomor telepon tidak terdaftar dalam sistem. Silakan hubungi admin untuk bantuan lebih lanjut.',
      isRegistered: false,
      waSent: false
    });
  } catch (error) {
    console.error('Error creating forgot passcode request:', error);
    return NextResponse.json(
      { error: 'Gagal memproses permintaan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
