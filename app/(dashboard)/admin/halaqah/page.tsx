import { prisma } from "@/lib/database/prisma";
import HalaqahClient from "./HalaqahClient";

// Opt out of caching if you want it to fetch fresh data on every request,
// or rely on router.refresh() from the client component.
export const dynamic = "force-dynamic";

export default async function AdminHalaqahPage() {
  // 1. Fetch halaqah data with Prisma optimization (select)
  const halaqahs = await prisma.halaqah.findMany({
    select: {
      id: true,
      namaHalaqah: true,
      guruId: true,
      guru: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      santri: {
        select: {
          santri: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  // Map halaqahs to the format expected by the client
  const initialHalaqah = halaqahs.map((h) => ({
    id: h.id,
    namaHalaqah: h.namaHalaqah,
    guruId: h.guruId,
    guru: h.guru,
    santri: h.santri.map((s) => s.santri),
    jumlahSantri: h.santri.length,
  }));

  // 2. Fetch guru data
  const gurus = await prisma.user.findMany({
    where: { role: { name: "guru" } },
    select: {
      id: true,
      namaLengkap: true,
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });

  // 3. Fetch unassigned santri data
  const assignedSantriIds = await prisma.halaqahSantri.findMany({
    select: { santriId: true },
  });
  
  const assignedIds = assignedSantriIds.map((as) => as.santriId);

  const availableSantris = await prisma.user.findMany({
    where: {
      role: { name: "santri" },
      id: {
        notIn: assignedIds,
      },
    },
    select: {
      id: true,
      namaLengkap: true,
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });

  return (
    <HalaqahClient
      initialHalaqah={initialHalaqah}
      guruList={gurus}
      availableSantriList={availableSantris}
    />
  );
}