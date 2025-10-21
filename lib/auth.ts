import jwt from 'jsonwebtoken';
import prisma from '@/lib/database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export interface AuthUser {
  id: number;
  namaLengkap: string;
  username: string;
  role: {
    id: number;
    name: string;
  };
  foto?: string | null;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Get authenticated user from request cookies
 */
export async function getAuthUser(request: Request): Promise<AuthResult> {
  try {
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        foto: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, error: 'Invalid token' };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role.name);
}

/**
 * Get santri IDs that a guru can access (from their halaqah)
 */
export async function getGuruSantriIds(guruId: number): Promise<number[]> {
  const halaqah = await prisma.halaqah.findMany({
    where: { guruId },
    include: {
      santri: {
        select: { santriId: true }
      }
    }
  });

  return halaqah.flatMap(h => h.santri.map(hs => hs.santriId));
}

/**
 * Get halaqah IDs that a guru can access
 */
export async function getGuruHalaqahIds(guruId: number): Promise<number[]> {
  const halaqah = await prisma.halaqah.findMany({
    where: { guruId },
    select: { id: true }
  });

  return halaqah.map(h => h.id);
}
