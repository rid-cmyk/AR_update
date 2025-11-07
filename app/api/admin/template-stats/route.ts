import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hitung statistik template ujian
    const totalTemplateUjian = await prisma.templateUjian.count();
    const aktifTemplateUjian = await prisma.templateUjian.count({
      where: { status: 'aktif' }
    });

    // Hitung statistik template raport
    const totalTemplateRaport = await prisma.templateRaport.count();
    const aktifTemplateRaport = await prisma.templateRaport.count({
      where: { status: 'aktif' }
    });

    const stats = {
      templateUjian: {
        total: totalTemplateUjian,
        aktif: aktifTemplateUjian,
        nonAktif: totalTemplateUjian - aktifTemplateUjian
      },
      templateRaport: {
        total: totalTemplateRaport,
        aktif: aktifTemplateRaport,
        nonAktif: totalTemplateRaport - aktifTemplateRaport
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching template stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch template stats" },
      { status: 500 }
    );
  }
}
