import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

// GET - Ambil daftar halaqah + guru untuk yayasan
// Yayasan bisa memilih halaqah mana yang ingin ditanyakan
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = decoded.id as number;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role.name !== "yayasan") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all halaqah with their guru
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        guruId: { not: null },
      },
      select: {
        id: true,
        namaHalaqah: true,
        guruId: true,
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            noTlp: true,
          },
        },
        _count: {
          select: { santri: true },
        },
      },
      orderBy: { namaHalaqah: "asc" },
    });

    const result = halaqahList
      .filter((h) => h.guru !== null)
      .map((h) => ({
        halaqahId: h.id,
        namaHalaqah: h.namaHalaqah,
        guruId: h.guru!.id,
        namaGuru: h.guru!.namaLengkap,
        noTlp: h.guru!.noTlp,
        jumlahSantri: h._count.santri,
      }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching halaqah guru for yayasan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
