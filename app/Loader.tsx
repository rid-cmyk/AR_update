"use client";
import { useEffect, useState } from "react";
import { Spin } from "antd";

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
