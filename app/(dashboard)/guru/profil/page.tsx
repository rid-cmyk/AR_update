"use client";

import UnifiedProfile from "@/components/profile/UnifiedProfile";

export default function GuruProfilePage() {
  return (
    <div style={{ padding: "24px 0" }}>
      <UnifiedProfile userRole="guru" />
    </div>
  );
}
