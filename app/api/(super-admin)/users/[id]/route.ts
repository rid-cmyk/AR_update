/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// UPDATE user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await req.json();

    let data: any = {
      username: body.username,
      namaLengkap: body.namaLengkap,
      noTlp: body.noTlp,
      roleId: body.roleId,
    };

    if (body.password && body.password.trim() !== "") {
      data.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: { role: true },
    });

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user", detail: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "User deleted" });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete user", detail: error.message }, { status: 500 });
  }
}
