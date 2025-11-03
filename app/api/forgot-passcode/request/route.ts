import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// POST - Create forgot passcode request (from public form)
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
        noTlp: true
      }
    });

    // Create notification for super admin
    const notification = await prisma.forgotPasscode.create({
      data: {
        phoneNumber: phoneNumber,
        message: message || 'Permintaan reset passcode melalui form',
        isRegistered: !!user,
        userId: user?.id || null
      },
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            foto: true
          }
        }
      }
    });

    // Return appropriate response
    if (user) {
      return NextResponse.json({
        success: true,
        message: 'Permintaan reset passcode berhasil dikirim. Admin akan segera memproses permintaan Anda.',
        isRegistered: true,
        user: {
          namaLengkap: user.namaLengkap,
          username: user.username
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Nomor telepon tidak terdaftar dalam sistem. Silakan hubungi admin untuk bantuan lebih lanjut.',
        isRegistered: false
      });
    }
  } catch (error) {
    console.error('Error creating forgot passcode request:', error);
    return NextResponse.json(
      { error: 'Gagal memproses permintaan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}