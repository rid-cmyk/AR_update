import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { formatPhoneNumber } from "@/lib/utils/phoneFormatter";

const prisma = new PrismaClient();

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    const whereClause = roleFilter ? {
      role: {
        name: {
          equals: roleFilter,
          mode: 'insensitive' as const
        }
      }
    } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove password from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { username, namaLengkap, email, noTlp, roleId, alamat, children, passCode } = await request.json();

    // Validate required fields
    if (!username || !namaLengkap || !roleId || !passCode) {
      return NextResponse.json(
        { error: 'Username, nama lengkap, role, dan passcode harus diisi' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }



    // Validate passcode (alphanumeric)
    if (!passCode || passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) {
      return NextResponse.json(
        { error: 'Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)' },
        { status: 400 }
      );
    }

    // Check if passcode already exists
    const existingPasscode = await prisma.user.findFirst({
      where: { passCode: passCode }
    });

    if (existingPasscode) {
      return NextResponse.json(
        { error: `Passcode sudah digunakan oleh ${existingPasscode.namaLengkap} (@${existingPasscode.username})` },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: email.trim() }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan' },
        { status: 400 }
      );
    }

    // Set default password (not used for login, passcode is used instead)
    const defaultPassword = await bcrypt.hash('default123', 10);

    // Format phone number if provided
    const formattedPhoneNumber = noTlp ? formatPhoneNumber(noTlp.trim()) : null;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        password: defaultPassword,
        namaLengkap: namaLengkap.trim(),
        email: email?.trim() || null,
        noTlp: formattedPhoneNumber,
        roleId: parseInt(roleId),
        alamat: alamat?.trim() || null,
        passCode: passCode,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Handle children for ortu role
    if (role.name.toLowerCase() === 'ortu' && children && children.length > 0) {
      // Validate children are santri
      const santriCheck = await prisma.user.findMany({
        where: {
          id: { in: children },
          role: {
            name: 'santri'
          }
        }
      });

      if (santriCheck.length === children.length) {
        // Create ortu-santri relationships
        await prisma.orangTuaSantri.createMany({
          data: children.map((santriId: number) => ({
            orangTuaId: newUser.id,
            santriId: santriId
          }))
        });
      }
    }

    // Remove password from response
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}