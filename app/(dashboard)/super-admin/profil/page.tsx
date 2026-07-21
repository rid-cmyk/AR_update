"use client";

import UnifiedProfile from "@/components/profile/UnifiedProfile";

export default function SuperAdminProfilePage() {
  return (
    <div style={{ padding: "24px 0" }}>
      <UnifiedProfile userRole="super_admin" />
    </div>
  );
}
