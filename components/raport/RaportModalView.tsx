"use client";

import React, { useState } from "react";
import { Modal, Button, Space, message } from "antd";
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

  const defaultData: RaportDataProps = data || {
    santri: {
      id: 1,
      namaLengkap: "Ahmad Zaki",
      nis: "20240105",
      username: "ahmad.zaki",
      halaqah: "Halaqah Abu Bakar",
      guru: "Ust. Hendri Sudianto",
    },
    akademik: {
      semester: "Genap",
      tahunAjaran: "2025/2026",
      tanggalCetak: "28 Juli 2026",
    },
    hafalan: {
      totalAyatHafal: 450,
      targetAyat: 500,
      persentaseTarget: 90,
      rataRataNilaiUjian: 91.5,
      ranking: 1,
      predikatAkhir: "Mumtaz (A-)",
    },
    rincianPenilaian: [
      { aspek: "Tajwid & Makhorijul Huruf", nilai: 92, predikat: "Mumtaz (A)" },
      { aspek: "Fashahah & Irama Bacaan", nilai: 88, predikat: "Mumtaz (A-)" },
      { aspek: "Kelancaran Hafalan (Hifzh)", nilai: 86, predikat: "Jayyid Jiddan (B+)" },
      { aspek: "Adab & Kedisiplinan Halaqah", nilai: 96, predikat: "Mumtaz (A+)" },
    ],
    absensi: {
      hadir: 82,
      sakit: 2,
      izin: 1,
      alpa: 0,
    },
    catatanGuru:
      "Alhamdulillah, Ahmad Zaki menunjukkan semangat hafalan yang luar biasa. Tajwid sangat rapi. Pertahankan konsistensi muroja'ah bakda subuh agar hafalan semakin mutqin.",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      message.loading({ content: "Menyiapkan dokumen Rapor...", key: "raport-dl" });

      const res = await fetch("/api/raport/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santriId: defaultData.santri.id,
          semester: defaultData.akademik.semester,
          tahunAjaran: defaultData.akademik.tahunAjaran,
          data: defaultData,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `Rapor_${defaultData.santri.namaLengkap.replace(/\s+/g, "_")}_${defaultData.akademik.semester}_${defaultData.akademik.tahunAjaran.replace("/", "-")}.html`;
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
      <RaportDocument data={defaultData} />
    </Modal>
  );
};

export default RaportModalView;
