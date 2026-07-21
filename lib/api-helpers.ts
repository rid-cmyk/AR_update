import { NextResponse } from 'next/server';
import { getAuthUser, hasRole } from '@/lib/auth';

/**
 * Standard API response helpers
 */
export class ApiResponse {
  static success(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
  }

  static error(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Not found') {
    return this.error(message, 404);
  }

  static serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(request?: Request, requiredRoles?: string[]) {
  const { user, error } = await getAuthUser(request);

  if (error || !user) {
    return { user: null, error: error || 'Unauthorized' };
  }

  if (requiredRoles && !hasRole(user, requiredRoles)) {
    return { user: null, error: 'Insufficient permissions' };
  }

  return { user, error: null };
}

import { prisma } from '@/lib/database/prisma';

/**
 * Common database query helpers
 */
export class DbHelpers {
  static async getUserHalaqah(userId: number) {
    return await prisma.halaqah.findMany({
      where: { guruId: userId },
      include: {
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      }
    });
  }

  static async getSantriIdsFromHalaqah(halaqahIds: number[]) {
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { halaqahId: { in: halaqahIds } },
      select: { santriId: true }
    });
    return halaqahSantri.map(hs => hs.santriId);
  }
}

/**
 * Validation helpers
 */
export class ValidationHelpers {
  static isValidDate(dateString: string) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeString(str: string) {
    return str.trim().replace(/[<>]/g, '');
  }
}