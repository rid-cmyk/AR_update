import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { withAuth } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalTahunAkademik,
      totalJenisUjian,
      totalTemplateUjian,
      totalTemplateRaport,
      totalKomponenPenilaian,
      templateUjianAktif,
      templateRaportAktif,
    ] = await Promise.all([
      prisma.tahunAjaran.count(),
      prisma.jenisUjian.count(),
      prisma.templateUjian.count(),
      prisma.templateRaport.count(),
      prisma.komponenPenilaian.count(),
      prisma.templateUjian.count({ where: { status: "aktif" } }),
      prisma.templateRaport.count({ where: { status: "aktif" } }),
    ]);

    return NextResponse.json({
      totalTahunAkademik,
      totalJenisUjian,
      totalTemplateUjian,
      totalTemplateRaport,
      totalKomponenPenilaian,
      templateUjian: {
        total: totalTemplateUjian,
        aktif: templateUjianAktif,
        nonAktif: totalTemplateUjian - templateUjianAktif,
      },
      templateRaport: {
        total: totalTemplateRaport,
        aktif: templateRaportAktif,
        nonAktif: totalTemplateRaport - templateRaportAktif,
      },
    });
  } catch (error) {
    console.error("Error fetching template stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch template stats" },
      { status: 500 }
    );
  }
}

