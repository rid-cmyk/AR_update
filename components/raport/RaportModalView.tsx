"use client";

import React, { useState } from "react";
import { Modal, Button, Space, message, Empty, Typography } from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import RaportDocument, { RaportDataProps } from "./RaportDocument";

export interface RaportModalViewProps {
  visible: boolean;
  onClose: () => void;
  data?: RaportDataProps;
  title?: string;
}

export const RaportModalView: React.FC<RaportModalViewProps> = ({
  visible,
  onClose,
  data,
  title = "Pratinjau Rapor Tahfizh Al-Quran",
}) => {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!data) return;

    try {
      setDownloading(true);
      message.loading({ content: "Menyiapkan dokumen Rapor...", key: "raport-dl" });

      const res = await fetch("/api/raport/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santriId: data.santri.id,
          semester: data.akademik.semester,
          tahunAjaran: data.akademik.tahunAjaran,
          data,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `Rapor_${data.santri.namaLengkap.replace(/\s+/g, "_")}_${data.akademik.semester}_${data.akademik.tahunAjaran.replace("/", "-")}.html`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        message.success({
          content: "Dokumen Rapor berhasil diunduh!",
          key: "raport-dl",
        });
      } else {
        message.error({
          content: "Gagal mengunduh Rapor",
          key: "raport-dl",
        });
      }
    } catch (error) {
      console.error("Error downloading raport:", error);
      message.error({
        content: "Terjadi kesalahan saat unduh Rapor",
        key: "raport-dl",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={
        data ? (
          <div className="flex justify-between items-center w-full px-2 py-1 no-print">
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Tutup
            </Button>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                loading={downloading}
                className="bg-slate-700 text-white hover:bg-slate-800 border-none"
              >
                Unduh Dokumen (HTML/PDF)
              </Button>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-500 border-none font-semibold shadow-md"
              >
                Cetak Langsung / Simpan PDF
              </Button>
            </Space>
          </div>
        ) : (
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Tutup
          </Button>
        )
      }
      width={900}
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold no-print">
          <FilePdfOutlined className="text-emerald-600 text-lg" />
          <span>{title}</span>
        </div>
      }
      centered
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "16px",
          backgroundColor: "#f8fafc",
        },
      }}
    >
      {data ? (
        <RaportDocument data={data} />
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">
              Belum ada data rapor. Rapor akan dibuat oleh guru/admin setelah evaluasi semester.
            </Typography.Text>
          }
          style={{ padding: "48px 16px" }}
        />
      )}
    </Modal>
  );
};

export default RaportModalView;
