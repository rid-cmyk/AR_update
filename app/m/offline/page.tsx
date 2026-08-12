"use client";

import React from "react";
import { Button } from "antd";
import { ReloadOutlined, WifiOutlined } from "@ant-design/icons";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f9fb] text-deep-space text-center">
      <div className="w-20 h-20 rounded-full bg-sky-blue/20 flex items-center justify-center mb-6 border border-sky-blue/30">
        <WifiOutlined className="text-4xl text-blue-green" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Anda Sedang Offline</h1>
      <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
        Koneksi internet Anda terputus. Beberapa halaman mungkin tidak dapat dimuat sampai Anda kembali terhubung ke jaringan.
      </p>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        size="large"
        onClick={handleRetry}
        className="bg-blue-green hover:bg-blue-green rounded-full px-8 h-12 font-medium"
      >
        Coba Lagi
      </Button>
    </div>
  );
}
