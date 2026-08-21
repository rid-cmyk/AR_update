import { prisma } from "@/lib/database/prisma"
import { cookies } from "next/headers"
import { verifyToken } from '@/lib/jwt'
import { getCachedAuth, setCachedAuth } from '@/lib/cache/auth-cache'

// AuthUser type definition
export interface AuthUser {
  id: number;
  username: string;
  namaLengkap: string;
  role: {
    name: string;
  };
  foto?: string;
}

// Get authenticated user from JWT token in cookies
export async function getAuthUser(request?: Request) {
  try {
    let token: string | undefined;
    
    if (request) {
      // Try to get token from request headers first
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Fallback to cookies
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          token = cookies['auth_token'];
        }
      }
    } else {
      // Server-side: use cookies() helper
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    }

    if (!token) {
      return { user: null, error: 'No authentication token found' };
    }

    const cachedUser = getCachedAuth(token);
    if (cachedUser) return { user: cachedUser as any, error: null };

    // Verify and decode JWT token
    const decoded = verifyToken<{ id: number; username: string; namaLengkap: string; role: string; foto?: string }>(token);
    
    if (!decoded || !decoded.id) {
      return { user: null, error: 'Invalid token' };
    }

    const authUser: AuthUser = {
      id: decoded.id,
      username: decoded.username,
      namaLengkap: decoded.namaLengkap,
      role: { name: decoded.role },
      foto: decoded.foto
    };

    setCachedAuth(token, authUser as any);

    return { user: authUser, error: null };
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    return { user: null, error: 'Authentication error' };
  }
}

// Check if user has specific role
export function hasRole(user: AuthUser, requiredRoles: string[]) {
  return requiredRoles.includes(user.role.name);
}

// Get santri IDs for a guru
export async function getGuruSantriIds(guruId: number) {
  try {
    // Get santri from guru's halaqah using correct relation
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        guruId: guruId
      },
      include: {
        santri: {
          include: {
            santri: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    // Extract santri IDs from all halaqah
    const santriIds: number[] = []
    halaqahList.forEach(halaqah => {
      halaqah.santri.forEach(hs => {
        santriIds.push(hs.santri.id)
      })
    })
    
    return santriIds
  } catch (error) {
    console.error("Error getting guru santri IDs:", error)
    return []
  }
}
