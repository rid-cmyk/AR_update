import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

// GET - Ambil data guru halaqah untuk orang tua
// Returns: guru info untuk setiap anak (halaqah yang diampu)
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

    if (!user || user.role.name !== "ortu") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all children of this parent
    const parentRelations = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: userId },
      select: { santriId: true },
    });

    const santriIds = parentRelations.map((r) => r.santriId);
    if (santriIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get halaqah for each child, then get the guru
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { santriId: { in: santriIds } },
      select: {
        halaqahId: true,
        santriId: true,
        halaqah: {
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
          },
        },
        santri: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    // Flatten: one entry per child-guru pair
    const result = halaqahSantri
      .filter((hs) => hs.halaqah.guru !== null)
      .map((hs) => ({
        guruId: hs.halaqah.guru!.id,
        namaGuru: hs.halaqah.guru!.namaLengkap,
        noTlp: hs.halaqah.guru!.noTlp,
        halaqahId: hs.halaqah.id,
        namaHalaqah: hs.halaqah.namaHalaqah,
        namaSantri: hs.santri.namaLengkap,
      }));

    // Deduplicate: same guru for same halaqah
    const seen = new Set<string>();
    const unique = result.filter((r) => {
      const key = `${r.guruId}-${r.halaqahId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ data: unique });
  } catch (error) {
    console.error("Error fetching guru halaqah for ortu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
