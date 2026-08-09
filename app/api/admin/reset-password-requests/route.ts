import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';



// GET - Fetch reset password requests for super-admin
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin', 'admin']);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const requests = await prisma.forgotPasscode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, namaLengkap: true, role: { select: { name: true } } } } }
    })
    const formattedRequests = requests.map(req => ({
      id: req.id,
      username: req.user?.username || 'Unknown',
      isRegistered: req.isRegistered,
      namaLengkap: req.user?.namaLengkap || null,
      role: req.user?.role?.name || null,
      createdAt: req.createdAt.toISOString(),
      isRead: req.isRead
    }))
    return NextResponse.json({ success: true, requests: formattedRequests })

  } catch (error) {
    console.error("Error fetching reset password requests:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data permintaan reset password" },
      { status: 500 }
    );
  }
}

// POST - Add new reset password request (called from forgot password page)
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username diperlukan" },
        { status: 400 }
      );
    }

    // Check if user exists in database
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

    return NextResponse.json({
      success: true,
      message: "Permintaan reset password telah dikirim"
    });

  } catch (error) {
    console.error("Error creating reset password request:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat permintaan reset password" },
      { status: 500 }
    );
  }
}

