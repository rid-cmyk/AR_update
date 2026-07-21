"use client";

import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import UnifiedProfile from "@/components/profile/UnifiedProfile";

export default function GuruProfilePage() {
  return (
    <div style={{ padding: "24px 0" }}>
      <AdminHeaderCard
        title="Profil Guru"
        subtitle="Kelola informasi profil dan akun Anda"
      />
      <UnifiedProfile userRole="guru" />
    </div>
  );
}
