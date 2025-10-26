import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { ApiResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return ApiResponse.error('Nomor telepon diperlukan', 400);
    }

    // Normalize phone number (remove spaces, dashes, and ensure starts with +62 or 08)
    let normalizedPhone = phoneNumber.replace(/[\s-]/g, '');
    
    // Convert 08 to +628
    if (normalizedPhone.startsWith('08')) {
      normalizedPhone = '+62' + normalizedPhone.substring(1);
    }
    
    // Ensure it starts with +62
    if (!normalizedPhone.startsWith('+62')) {
      normalizedPhone = '+62' + normalizedPhone;
    }

    // Search for user with this phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { noTlp: phoneNumber },
          { noTlp: normalizedPhone },
          { noTlp: phoneNumber.replace(/^\+62/, '08') }, // Try 08 format
          { noTlp: phoneNumber.replace(/^08/, '+628') }   // Try +628 format
        ]
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        noTlp: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    if (user) {
      // User found - generate WhatsApp message
      const adminWhatsApp = '081213923253';
      const message = `Lapor Admin: Saya lupa passcode pada AR-Hafalan dengan user ${user.namaLengkap}`;
      const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

      // Log the forgot passcode attempt
      await prisma.auditLog.create({
        data: {
          action: 'FORGOT_PASSCODE_REQUEST',
          keterangan: `User ${user.namaLengkap} (${user.username}) meminta reset passcode melalui nomor ${phoneNumber}`,
          userId: user.id
        }
      });

      return ApiResponse.success({
        found: true,
        user: {
          namaLengkap: user.namaLengkap,
          username: user.username,
          role: user.role.name
        },
        whatsappUrl,
        message: `Data ditemukan! Anda akan diarahkan ke WhatsApp untuk menghubungi admin dengan pesan otomatis.`,
        adminPhone: adminWhatsApp
      });
    } else {
      // User not found
      const adminWhatsApp = '081213923253';
      const message = `Hubungi Admin ARHafalan untuk konfirmasi data dengan nomor ${phoneNumber}`;
      const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

      // Note: Not logging to audit log since we don't have a userId for unknown numbers

      return ApiResponse.success({
        found: false,
        whatsappUrl,
        message: `Nomor tidak ditemukan dalam database. Silakan hubungi admin untuk konfirmasi data Anda.`,
        adminPhone: adminWhatsApp
      });
    }

  } catch (error) {
    console.error('Error in forgot passcode:', error);
    return ApiResponse.serverError('Terjadi kesalahan sistem');
  }
}