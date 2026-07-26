import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import TemplateUjianClient from "./TemplateUjianClient";

export const dynamic = "force-dynamic";

export default async function TemplateUjianPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "admin") {
    redirect("/login");
  }

  const templates = await prisma.templateUjian.findMany({
    include: {
      komponenPenilaian: {
        orderBy: { urutan: 'asc' }
      },
      tahunAjaran: true,
      creator: {
        select: {
          id: true,
          namaLengkap: true
        }
      },
      _count: {
        select: {
          ujianSantri: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <TemplateUjianClient initialTemplates={templates as any} />;
}