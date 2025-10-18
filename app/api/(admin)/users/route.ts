/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


// GET all users with optional role filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const excludeAssigned = searchParams.get('excludeAssigned') === 'true';

    const where: Record<string, any> = {};
    if (role) {
      where.role = {
        name: role
      };
    }

    // If excludeAssigned is true, filter out santri who are already assigned to halaqah
    if (excludeAssigned && role === 'santri') {
      // Get all santri IDs that are already assigned to halaqah
      const assignedSantriIds = await prisma.halaqahSantri.findMany({
        select: {
          santriId: true
        }
      });

      const assignedIds = assignedSantriIds.map(item => item.santriId);

      if (assignedIds.length > 0) {
        where.id = {
          notIn: assignedIds
        };
      }
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true },
    });

    const safeUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET /api/(admin)/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// CREATE user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Creating user with body:", body);

    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { error: "Missing required fields: username, password, roleId" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        namaLengkap: body.namaLengkap || "",
        noTlp: body.noTlp || null,
        passCode: body.passCode || null,
        roleId: Number(body.roleId),
      },
      include: { role: true },
    });

    // filter password
    const { password, ...safeUser } = user;
    console.log("User created:", safeUser);
    console.log("PassCode stored:", body.passCode);
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("POST /api/(admin)/users error:", error);
    return NextResponse.json({
      error: "Failed to create user",
      details: error.message
    }, { status: 500 });
  }
}