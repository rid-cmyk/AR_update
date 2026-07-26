import LoadingSkeleton from "@/components/layout/LoadingSkeleton";

export default function AdminLoading() {
  return (
    <div style={{ padding: "24px 0" }}>
      <LoadingSkeleton type="dashboard" />
    </div>
  );
}
