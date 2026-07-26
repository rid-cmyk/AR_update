import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import TemplateRaportClient from "./TemplateRaportClient";

export const dynamic = "force-dynamic";

export default async function TemplateRaportPage() {
  const { user } = await getAuthUser();
  if (!user || user.role.name !== "admin") {
    redirect("/login");
  }

  const templates = await prisma.templateRaport.findMany({
    include: {
      tahunAjaran: true,
      creator: {
        select: {
          id: true,
          namaLengkap: true
        }
      },
      _count: {
        select: {
          raportSantri: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <TemplateRaportClient initialTemplates={templates as any} />;
}