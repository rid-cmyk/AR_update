import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatPhoneNumber } from "@/lib/utils/phoneFormatter";

const prisma = new PrismaClient();

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { username, namaLengkap, email, noTlp, roleId, alamat, children, passCode } = await request.json();
    const { id } = await params;
    const userId = parseInt(id);

    // Validate required fields
    if (!username || !namaLengkap || !roleId) {
      return NextResponse.json(
        { error: 'Username, nama lengkap, dan role harus diisi' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if username already exists (excluding current user)
    const duplicateUsername = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        id: { not: userId }
      }
    });

    if (duplicateUsername) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Check if email already exists (excluding current user, if provided)
    if (email) {
      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email: email.trim(),
          id: { not: userId }
        }
      });

      if (duplicateEmail) {
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

    // Validate and check passcode if provided
    if (passCode) {
      // Validate passcode format (alphanumeric)
      if (passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) {
        return NextResponse.json(
          { error: 'Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)' },
          { status: 400 }
        );
      }

      // Check if passcode already exists (excluding current user)
      const existingPasscode = await prisma.user.findFirst({
        where: {
          passCode: passCode,
          id: { not: userId }
        }
      });

      if (existingPasscode) {
        return NextResponse.json(
          { error: `Passcode sudah digunakan oleh ${existingPasscode.namaLengkap} (@${existingPasscode.username})` },
          { status: 400 }
        );
      }
    }

    // Format phone number if provided
    const formattedPhoneNumber = noTlp ? formatPhoneNumber(noTlp.trim()) : null;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username.trim(),
        namaLengkap: namaLengkap.trim(),
        email: email?.trim() || null,
        noTlp: formattedPhoneNumber,
        roleId: parseInt(roleId),
        alamat: alamat?.trim() || null,
        ...(passCode && { passCode: passCode }),
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

    // Sync forgot passcode notifications if phone number changed
    if (formattedPhoneNumber && formattedPhoneNumber !== existingUser.noTlp) {
      try {
        // Update existing forgot passcode notifications with the new phone number
        await prisma.forgotPasscode.updateMany({
          where: {
            phoneNumber: formattedPhoneNumber,
            isRegistered: false
          },
          data: {
            isRegistered: true,
            userId: userId
          }
        });

        // Also update notifications that might have the old phone number
        if (existingUser.noTlp) {
          await prisma.forgotPasscode.updateMany({
            where: {
              phoneNumber: existingUser.noTlp,
              userId: userId
            },
            data: {
              phoneNumber: formattedPhoneNumber
            }
          });
        }
      } catch (syncError) {
        console.warn('Failed to sync forgot passcode notifications:', syncError);
        // Don't fail the user update if sync fails
      }
    }

    // Handle children for ortu role
    if (role.name.toLowerCase() === 'ortu' && children !== undefined) {
      // Delete existing relationships first
      await prisma.orangTuaSantri.deleteMany({
        where: { orangTuaId: userId }
      });

      // Create new relationships if children provided
      if (children && children.length > 0) {
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
          await prisma.orangTuaSantri.createMany({
            data: children.map((santriId: number) => ({
              orangTuaId: userId,
              santriId: santriId
            }))
          });
        } else {
          throw new Error('Beberapa santri yang dipilih tidak valid');
        }
      }
    }

    // Remove password from response
    const { password, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent deletion of super admin
    if (existingUser.role.name.toLowerCase() === 'super_admin') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus Super Admin' },
        { status: 400 }
      );
    }

    // Check for related data that might prevent deletion
    // You might want to add more checks here based on your business logic

    // Delete user (cascade deletes will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus user yang masih memiliki data terkait' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}