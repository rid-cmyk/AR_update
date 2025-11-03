import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          },
          include: {
            role: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          username: user.username,
          namaLengkap: user.namaLengkap,
          role: user.role.name,
          foto: user.foto
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.namaLengkap = user.namaLengkap
        token.role = user.role
        token.foto = user.foto
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.namaLengkap = token.namaLengkap as string
        session.user.role = token.role as string
        session.user.foto = token.foto as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
}

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

    // Verify and decode JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.id) {
      return { user: null, error: 'Invalid token' };
    }

    // Get full user data with role information
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      role: user.role,
      foto: user.foto || undefined
    };

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
    const santriList = await prisma.santri.findMany({
      where: {
        guruId: guruId
      },
      select: {
        id: true
      }
    })
    
    return santriList.map(santri => santri.id)
  } catch (error) {
    console.error("Error getting guru santri IDs:", error)
    return []
  }
}