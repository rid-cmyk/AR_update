import { prisma } from '@/lib/database/prisma';
import { notifyForgotPasscode } from "@/lib/services/whatsapp-notifier";
import {
  checkForgotPasscodeCooldown,
  recordForgotPasscodeAttempt,
  resetForgotPasscodeAttempts,
} from "@/lib/utils/forgotPasscodeCooldown";

export class ForgotPasscodeServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ForgotPasscodeServiceError';
  }
}

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
  return `P${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export class ForgotPasscodeService {
  static async listAll() {
    const requests = await prisma.forgotPasscode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, namaLengkap: true, role: { select: { name: true } } } } }
    });
    return requests.map(req => ({
      id: req.id,
      username: req.user?.username || 'Unknown',
      isRegistered: req.isRegistered,
      namaLengkap: req.user?.namaLengkap || null,
      role: req.user?.role?.name || null,
      createdAt: req.createdAt.toISOString(),
      isRead: req.isRead
    }));
  }

  static async create(username: string) {
    if (!username) {
      throw new ForgotPasscodeServiceError('Username diperlukan', 400);
    }
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }
    });
    await prisma.forgotPasscode.create({
      data: {
        phoneNumber: username,
        isRegistered: !!user,
        ...(user ? { userId: user.id } : {})
      }
    });
    return { message: 'Permintaan reset password telah dikirim' };
  }

  static async resetPasscode(phoneNumber: string, message: string | undefined, clientIp: string) {
    if (!phoneNumber) throw new ForgotPasscodeServiceError('Nomor telepon harus diisi', 400);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new ForgotPasscodeServiceError('Format nomor telepon tidak valid', 400);
    }

    const cooldownKey = `${cleanPhone.slice(-10)}|${clientIp}`;
    const cooldownStatus = checkForgotPasscodeCooldown(cooldownKey);
    if (cooldownStatus.locked) {
      const menit = Math.ceil(cooldownStatus.remainingMs / 60000);
      throw new ForgotPasscodeServiceError(`Terlalu banyak permintaan. Silakan tunggu ${menit} menit.`, 429);
    }

    const user = await prisma.user.findFirst({
      where: { noTlp: { contains: cleanPhone.slice(-10) } },
      select: { id: true, namaLengkap: true, username: true, noTlp: true, passCode: true }
    });

    if (user) {
      const newPasscode = await generateUniquePasscode(user.passCode || undefined);
      
      let waSent = false;
      try {
        waSent = await notifyForgotPasscode(user.id, newPasscode);
      } catch (error) {
        console.error('Error sending forgot passcode WhatsApp:', error);
        waSent = false;
      }

      if (!waSent) {
        throw new ForgotPasscodeServiceError('Gagal mengirimkan passcode baru via WhatsApp. Nomor tidak aktif atau server gangguan. Passcode Anda TIDAK diubah.', 500);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { passCode: newPasscode },
        select: { id: true, namaLengkap: true, username: true }
      });

      await prisma.forgotPasscode.create({
        data: {
          phoneNumber: phoneNumber,
          message: message || 'Passcode direset otomatis melalui form',
          isRegistered: true,
          userId: user.id,
          isRead: true
        }
      });

      resetForgotPasscodeAttempts(cooldownKey);

      return {
        success: true,
        message: 'Passcode baru telah dikirim via WhatsApp. Silakan cek pesan masuk Anda.',
        isRegistered: true,
        waSent: true,
        user: { namaLengkap: updatedUser.namaLengkap, username: updatedUser.username }
      };
    }

    recordForgotPasscodeAttempt(cooldownKey);
    await prisma.forgotPasscode.create({
      data: {
        phoneNumber: phoneNumber,
        message: message || 'Permintaan reset passcode melalui form',
        isRegistered: false,
        userId: null
      }
    });

    return {
      success: true,
      message: 'Nomor telepon tidak terdaftar dalam sistem. Silakan hubungi admin untuk bantuan lebih lanjut.',
      isRegistered: false,
      waSent: false
    };
  }
}
