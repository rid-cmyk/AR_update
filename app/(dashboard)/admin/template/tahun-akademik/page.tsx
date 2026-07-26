import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { redirect } from "next/navigation";
import TemplateTahunAkademikClient from "./TemplateTahunAkademikClient";

export const dynamic = "force-dynamic";

export default async function TahunAkademikPage() {
  const { user } = await getAuthUser();
  if (!user || (user.role.name !== "admin" && user.role.name !== "super_admin")) {
    redirect("/login");
  }

  const [
    totalTahunAkademik,
    totalTemplateUjian,
    totalTemplateRaport,
    totalKomponenPenilaian,
  ] = await Promise.all([
    prisma.tahunAjaran.count(),
    prisma.templateUjian.count(),
    prisma.templateRaport.count(),
    prisma.komponenPenilaian.count(),
  ]);

  const initialStats = {
    totalTahunAkademik,
    totalTemplateUjian,
    totalTemplateRaport,
    totalKomponenPenilaian,
  };

  return <TemplateTahunAkademikClient initialStats={initialStats} />;
}
