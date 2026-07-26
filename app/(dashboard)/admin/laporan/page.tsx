import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LaporanClient from "./LaporanClient";

export const dynamic = "force-dynamic";

export default async function AdminLaporanPage() {
  const { user } = await getAuthUser();
  if (!user || (user.role.name !== "admin" && user.role.name !== "super_admin")) {
    redirect("/login");
  }

  // We let the client handle data fetching since the query depends heavily on client-side state
  return <LaporanClient />;
}
