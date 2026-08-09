"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Space,
  Popconfirm,
  message,
  Select,
  DatePicker,
  TimePicker,
  Typography,
} from "antd";
import type { ColumnType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import JadwalStatistics from "@/components/admin/jadwal/JadwalStatistics";
import JadwalFormModal from "@/components/admin/jadwal/JadwalFormModal";
import dayjs from "dayjs";
import LoadingSkeleton from "@/components/layout/LoadingSkeleton";
import { useRouter } from "next/navigation";

const DynamicTable = dynamic(() => import("antd").then((mod) => mod.Table), {
  ssr: false,
  loading: () => <LoadingSkeleton type="table" count={5} />,
});

const DynamicModal = dynamic(() => import("antd").then((mod) => mod.Modal), {
  ssr: false,
});

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: Date | string;
  jamSelesai: Date | string;
  isTemplate?: boolean;
  isActive?: boolean;
  tanggalMulai?: Date | string | null;
  tanggalSelesai?: Date | string | null;
  halaqah: {
    id: number;
    namaHalaqah: string;
    guru?: {
      id: number;
      namaLengkap: string;
    } | null;
    jumlahSantri?: number;
  };
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
}

interface JadwalClientProps {
  initialJadwal: Jadwal[];
  halaqahList: Halaqah[];
  thisWeekCount: number;
}

export default function JadwalClient({
  initialJadwal,
  halaqahList,
  thisWeekCount,
}: JadwalClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [form] = Form.useForm();

  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
    { value: "Minggu", label: "Minggu" },
  ];

  const openModal = (jadwal?: Jadwal) => {
    if (jadwal) {
      setEditingJadwal(jadwal);
      const formValues: any = {
        halaqahId: jadwal.halaqah.id,
        hari: jadwal.hari,
        jamMulai: dayjs(jadwal.jamMulai),
        jamSelesai: dayjs(jadwal.jamSelesai),
        isTemplate: jadwal.isTemplate ?? true,
        isActive: jadwal.isActive ?? true,
      };

      if (jadwal.tanggalMulai) {
        formValues.tanggalMulai = dayjs(jadwal.tanggalMulai);
      }
      if (jadwal.tanggalSelesai) {
        formValues.tanggalSelesai = dayjs(jadwal.tanggalSelesai);
      }

      if (!jadwal.isTemplate && jadwal.tanggalMulai) {
        formValues.tanggalSpesifik = dayjs(jadwal.tanggalMulai);
      }

      form.setFieldsValue(formValues);
    } else {
      setEditingJadwal(null);
      form.resetFields();
      form.setFieldsValue({
        isTemplate: true,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload: any = {
        hari: values.hari,
        jamMulai: values.jamMulai ? values.jamMulai.format("HH:mm:ss") : "08:00:00",
        jamSelesai: values.jamSelesai
          ? values.jamSelesai.format("HH:mm:ss")
          : "10:00:00",
        halaqahId: parseInt(values.halaqahId),
        isTemplate: Boolean(values.isTemplate ?? true),
        isActive: Boolean(values.isActive ?? true),
      };

      try {
        if (values.isTemplate !== false) {
          if (values.tanggalMulai && values.tanggalMulai.isValid()) {
            payload.tanggalMulai = values.tanggalMulai.format("YYYY-MM-DD");
          }
          if (values.tanggalSelesai && values.tanggalSelesai.isValid()) {
            payload.tanggalSelesai = values.tanggalSelesai.format("YYYY-MM-DD");
          }
        } else {
          payload.isTemplate = false;
          if (values.tanggalSpesifik && values.tanggalSpesifik.isValid()) {
            payload.tanggalMulai = values.tanggalSpesifik.format("YYYY-MM-DD");
            payload.tanggalSelesai = values.tanggalSpesifik.format("YYYY-MM-DD");
          }
        }
      } catch (dateError) {
        console.warn("Date processing error:", dateError);
      }

      setLoading(true);
      const url = editingJadwal
        ? `/api/jadwal/${editingJadwal.id}`
        : "/api/jadwal";
      const method = editingJadwal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;
        try {
          const responseText = await res.text();
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || errorData.details || `Failed to save jadwal`);
      }

      const successMessage = editingJadwal
        ? "Jadwal berhasil diperbarui"
        : values.isTemplate
        ? "Template jadwal berhasil dibuat! Jadwal akan berulang setiap minggu."
        : "Jadwal spesifik berhasil dibuat!";

      message.success(successMessage);
      setIsModalOpen(false);
      form.resetFields();
      router.refresh();
    } catch (error: unknown) {
      console.error("Error saving jadwal:", error);
      message.error(error instanceof Error ? error.message : "Error saving jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jadwal/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete jadwal (${res.status})`);
      }

      message.success("Jadwal berhasil dihapus");
      router.refresh();
    } catch (error: unknown) {
      console.error("Error deleting jadwal:", error);
      message.error(error instanceof Error ? error.message : "Error deleting jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jadwal/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to toggle status (${res.status})`);
      }

      const data = await res.json();
      message.success(data.message);
      router.refresh();
    } catch (error: unknown) {
      console.error("Error toggling status:", error);
      message.error(error instanceof Error ? error.message : "Error toggling status");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnType<any>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (halaqah: any) => halaqah?.namaHalaqah || "Unknown",
    },
    {
      title: "Hari",
      dataIndex: "hari",
      key: "hari",
    },
    {
      title: "Waktu",
      key: "waktu",
      render: (_: unknown, record: Jadwal) => (
        <div>
          <div style={{ fontWeight: "bold" }}>
            {dayjs(record.jamMulai).format("HH:mm")} -{" "}
            {dayjs(record.jamSelesai).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Mode & Status",
      key: "status",
      render: (_: unknown, record: any) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            {record.isTemplate ? (
              <Typography.Text style={{ fontSize: "12px", color: "#219ebc" }}>
                📅 Template
              </Typography.Text>
            ) : (
              <Typography.Text style={{ fontSize: "12px", color: "#ffb703" }}>
                📆 Spesifik
              </Typography.Text>
            )}
          </div>
          <div>
            {record.isActive ? (
              <Typography.Text style={{ fontSize: "12px", color: "#219ebc" }}>
                🟢 Aktif
              </Typography.Text>
            ) : (
              <Typography.Text style={{ fontSize: "12px", color: "#fb8500" }}>
                🔴 Nonaktif
              </Typography.Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Guru",
      key: "guru",
      render: (_: unknown, record: Jadwal) => (
        <div>{record.halaqah.guru?.namaLengkap || "Belum ditentukan"}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: any) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              size="small"
            >
              Edit
            </Button>
            <Button
              type="text"
              onClick={() => handleToggleStatus(record.id)}
              size="small"
              style={{
                color: record.isActive ? "#fb8500" : "#219ebc",
              }}
            >
              {record.isActive ? "🔴 Nonaktifkan" : "🟢 Aktifkan"}
            </Button>
          </Space>
          <Popconfirm
            title="Are you sure you want to delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "24px 0" }}>
        <AdminHeaderCard
          title="Jadwal"
          subtitle="Kelola jadwal kegiatan halaqah"
        />

        <JadwalStatistics 
          initialJadwalCount={initialJadwal.length}
          halaqahListCount={halaqahList.length}
          thisWeekCount={thisWeekCount}
        />

        {/* Main Content */}
        <Card
          title="Schedule List"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Add Schedule
            </Button>
          }
        >
          <DynamicTable
            dataSource={initialJadwal}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>

        {/* Modal */}
        <JadwalFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          handleSave={handleSave}
          editingJadwal={editingJadwal}
          halaqahList={halaqahList}
          hariOptions={hariOptions}
        />
      </div>
    </>
  );
}
