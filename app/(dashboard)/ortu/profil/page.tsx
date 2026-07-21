"use client";

import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import UnifiedProfile from "@/components/profile/UnifiedProfile";

export default function OrtuProfilePage() {
  return (
    <div style={{ padding: "24px 0" }}>
      <AdminHeaderCard
        title="Profil Orang Tua"
        subtitle="Kelola informasi profil dan akun Anda"
      />
      <UnifiedProfile userRole="ortu" />
    </div>
  );
}
