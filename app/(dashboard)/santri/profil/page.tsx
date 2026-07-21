"use client";

import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import UnifiedProfile from "@/components/profile/UnifiedProfile";

export default function SantriProfilePage() {
  return (
    <div style={{ padding: "24px 0" }}>
      <AdminHeaderCard
        title="Profil Santri"
        subtitle="Kelola informasi profil dan akun Anda"
      />
      <UnifiedProfile userRole="santri" />
    </div>
  );
}
