import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import GuruPermissionsClient from "./GuruPermissionsClient";

export const dynamic = "force-dynamic";

export default async function GuruPermissionsPage() {
  const { user } = await getAuthUser();
  if (!user || (user.role.name !== "admin" && user.role.name !== "super_admin")) {
    redirect("/login");
  }

  const [permissions, gurus, halaqahs] = await Promise.all([
    prisma.guruPermission.findMany({
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            id: true,
            namaHalaqah: true,
            guru: {
              select: {
                namaLengkap: true
              }
            }
          }
        }
      },
      orderBy: [
        { guru: { namaLengkap: 'asc' } },
        { halaqah: { namaHalaqah: 'asc' } }
      ]
    }),
    prisma.user.findMany({
      where: {
        role: {
          name: 'guru'
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      },
      orderBy: {
        namaLengkap: 'asc'
      }
    }),
    prisma.halaqah.findMany({
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        }
      },
      orderBy: {
        namaHalaqah: 'asc'
      }
    })
  ]);

  const formattedPermissions = permissions.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString()
  }));

  return (
    <GuruPermissionsClient 
      initialPermissions={formattedPermissions as any} 
      initialGurus={gurus}
      initialHalaqahs={halaqahs as any}
    />
  );
}