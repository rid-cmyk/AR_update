import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch reset password requests for super-admin
export async function GET(request: NextRequest) {
  try {
    // Check if user is super-admin (you might want to add proper auth check here)
    
    // For now, we'll simulate reset password requests
    // In a real implementation, you would have a separate table for this
    const mockRequests = [
      {
        id: 1,
        username: "santri001",
        isRegistered: true,
        namaLengkap: "Ahmad Santri",
        role: "Santri",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        username: "unknown_user",
        isRegistered: false,
        namaLengkap: null,
        role: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      }
    ];

    return NextResponse.json({
      success: true,
      requests: mockRequests
    });

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

    // In a real implementation, you would save this to a reset_password_requests table
    // For now, we'll just return the result
    const requestData = {
      username,
      isRegistered: !!user,
      namaLengkap: user?.namaLengkap || null,
      role: user?.role?.name || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Permintaan reset password telah dikirim",
      request: requestData
    });

  } catch (error) {
    console.error("Error creating reset password request:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat permintaan reset password" },
      { status: 500 }
    );
  }
}