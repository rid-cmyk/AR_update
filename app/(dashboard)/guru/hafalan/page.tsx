import { getAuthUser, getGuruSantriIds } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import HafalanClient from "./HafalanClient";

export const dynamic = "force-dynamic";

export default async function DataHafalanPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "guru") {
    redirect("/login");
  }

  // 1. Dapatkan daftar ID santri yang diajar oleh guru ini
  const santriIds = await getGuruSantriIds(user.id);

  if (santriIds.length === 0) {
    return (
      <HafalanClient initialHafalanList={[]} initialSantriList={[]} />
    );
  }

  // 2. Fetch initial santri list (hanya santri dari guru ini)
  const santriList = await prisma.user.findMany({
    where: {
      id: { in: santriIds },
      role: { name: "santri" },
    },
    select: {
      id: true,
      namaLengkap: true,
      username: true,
    },
    orderBy: {
      namaLengkap: 'asc'
    }
  });

  // 3. Fetch initial hafalan data for the table (limit 50 by default, un-filtered)
  const hafalanList = await prisma.hafalan.findMany({
    where: {
      santriId: { in: santriIds },
    },
    include: {
      santri: {
        select: {
          id: true,
          namaLengkap: true,
          username: true,
        },
      },
    },
    orderBy: {
      tanggal: "desc",
    },
    take: 50,
  });

  // Format dates to string to prevent serialization errors in Next.js props
  const formattedHafalanList = hafalanList.map(h => ({
    ...h,
    tanggal: h.tanggal.toISOString(),
  }));

  return (
    <HafalanClient
      initialHafalanList={formattedHafalanList as any}
      initialSantriList={santriList}
    />
  );
}