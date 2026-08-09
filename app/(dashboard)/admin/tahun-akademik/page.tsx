import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import TahunAkademikClient from "./TahunAkademikClient";

export const dynamic = "force-dynamic";

export default async function TahunAkademikPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "admin") {
    redirect("/login");
  }

  // Fetch all tahun ajaran with counts
  const tahunAjaran = await prisma.tahunAjaran.findMany({
    include: {
      creator: {
        select: {
          id: true,
          namaLengkap: true,
          username: true,
        },
      },
      semesters: true,
      _count: {
        select: {
          templateUjian: true,
          templateRaport: true,
          ujianSantri: true,
          raportSantri: true,
        },
      },
    },
    orderBy: [{ tahunMulai: "desc" }],
  });

  // Format dates to string to prevent serialization errors
  const formattedTahunAjaran = tahunAjaran.map((ta) => ({
    ...ta,
    tanggalMulai: ta.tanggalMulai.toISOString(),
    tanggalSelesai: ta.tanggalSelesai.toISOString(),
    createdAt: ta.createdAt.toISOString(),
    updatedAt: ta.updatedAt.toISOString(),
  }));

  return <TahunAkademikClient initialTahunAkademik={formattedTahunAjaran as any} />;
}