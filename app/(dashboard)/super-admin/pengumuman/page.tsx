import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import PengumumanClient from "./PengumumanClient";

export const dynamic = "force-dynamic";

export default async function AdminPengumumanPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "super_admin") {
    redirect("/login");
  }

  // Same logic as in API route for initial fetch (first page, limit 10)
  const limit = 10;
  
  const whereClause: Prisma.PengumumanWhereInput = {
    AND: [
      {
        OR: [
          { tanggalKadaluarsa: null },
          { tanggalKadaluarsa: { gte: new Date() } },
        ],
      },
    ],
  };

  const pengumuman = await prisma.pengumuman.findMany({
    where: whereClause,
    include: {
      creator: {
        select: {
          id: true,
          namaLengkap: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
      dibacaOleh: {
        select: {
          dibacaPada: true,
          user: {
            select: {
              id: true,
              namaLengkap: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          dibacaOleh: true,
        },
      },
    },
    orderBy: {
      tanggal: "desc",
    },
    take: limit,
  });

  const formatted = pengumuman.map((p) => ({
    id: p.id,
    judul: p.judul,
    isi: p.isi,
    tanggal: p.tanggal.toISOString(),
    tanggalKadaluarsa: p.tanggalKadaluarsa ? p.tanggalKadaluarsa.toISOString() : null,
    targetAudience: p.targetAudience,
    creator: p.creator,
    isRead: p.dibacaOleh.length > 0,
    readCount: p._count.dibacaOleh,
    readDetails: p.dibacaOleh.map((read: any) => ({
      userId: read.user.id,
      userName: read.user.namaLengkap,
      userRole: read.user.role.name,
      readAt: read.dibacaPada.toISOString(),
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PengumumanClient initialPengumuman={formatted as any} />;
}