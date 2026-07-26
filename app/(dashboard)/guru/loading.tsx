import LoadingSkeleton from "@/components/layout/LoadingSkeleton";

export default function GuruLoading() {
  return (
    <div style={{ padding: "24px 0" }}>
      <LoadingSkeleton type="dashboard" />
    </div>
  );
}
