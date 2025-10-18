"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Space,
  Progress,
  Tag,
  FloatButton,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface TargetHafalan {
  id: number;
  santri: Santri;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  progress?: number; // calculated field
}

export default function TargetHafalanPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [targetList, setTargetList] = useState<TargetHafalan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetHafalan | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<number | null>(null);

  const [form] = Form.useForm();

  // Daftar surat Al-Qur'an (simplified)
  const suratList = [
    "Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Ma'idah",
    // Add more as needed
  ];

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/(guru)/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Combine all santri from all halaqah
        const allSantri: Santri[] = [];
        (data.halaqah || []).forEach((halaqah: Halaqah) => {
          if (halaqah.santri) {
            halaqah.santri.forEach(santri => {
              if (!allSantri.find(s => s.id === santri.id)) {
                allSantri.push(santri);
              }
            });
          }
        });
        setSantriList(allSantri);
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch target hafalan
  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/target`);
      if (res.ok) {
        const data = await res.json();
        // Calculate progress for each target
        const targetsWithProgress = data.map((target: TargetHafalan) => ({
          ...target,
          progress: calculateProgress(target)
        }));
        setTargetList(targetsWithProgress);
      }
    } catch (error) {
      console.error("Error fetching targets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress based on completed hafalan
  const calculateProgress = (target: TargetHafalan): number => {
    // This would need to query hafalan data for the santri and surat
    // For now, return a mock progress
    return Math.floor(Math.random() * 100);
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleSaveTarget = async () => {
    try {
      const values = await form.validateFields();
      // Find halaqah for the selected santri
      let halaqahId = null;
      for (const halaqah of halaqahList) {
        if (halaqah.santri && halaqah.santri.find(s => s.id === values.santriId)) {
          halaqahId = halaqah.id;
          break;
        }
      }

      const payload = {
        ...values,
        halaqahId,
        status: "belum",
      };

      const url = editingTarget ? `/api/target/${editingTarget.id}` : "/api/target";
      const method = editingTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(editingTarget ? "Target berhasil diperbarui" : "Target berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        fetchTargets();
      } else {
        message.error("Gagal menyimpan target");
      }
    } catch (error) {
      console.error("Error saving target:", error);
    }
  };

  const handleDeleteTarget = async (id: number) => {
    try {
      const res = await fetch(`/api/target/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Target berhasil dihapus");
        fetchTargets();
      } else {
        message.error("Gagal menghapus target");
      }
    } catch (error) {
      console.error("Error deleting target:", error);
    }
  };

  const openModal = (target?: TargetHafalan) => {
    if (target) {
      setEditingTarget(target);
      form.setFieldsValue({
        ...target,
        deadline: dayjs(target.deadline)
      });
    } else {
      setEditingTarget(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai": return "green";
      case "Tertunda": return "orange";
      case "BelumSelesai": return "blue";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Ayat Target",
      dataIndex: "ayatTarget",
      key: "ayatTarget",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: TargetHafalan) => (
        <div style={{ width: 100 }}>
          <Progress percent={record.progress || 0} size="small" />
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: TargetHafalan) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTarget(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Target Hafalan</h1>

        {/* Filter Controls */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter Santri (Opsional)"
            style={{ width: 200 }}
            value={selectedSantri}
            onChange={(value) => setSelectedSantri(value)}
            allowClear
            disabled={halaqahList.length === 0}
          >
            {santriList.map((santri) => (
              <Option key={santri.id} value={santri.id}>
                {santri.namaLengkap}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={targetList}
          rowKey="id"
          loading={loading}
        />

        {/* Modal */}
        <Modal
          title={editingTarget ? "Edit Target Hafalan" : "Tambah Target Hafalan"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveTarget}
          okText="Simpan"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Santri"
              name="santriId"
              rules={[{ required: true, message: "Pilih santri" }]}
            >
              <Select placeholder="Pilih Santri">
                {santriList.map((santri) => (
                  <Option key={santri.id} value={santri.id}>
                    {santri.namaLengkap}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Surat"
              name="surat"
              rules={[{ required: true, message: "Pilih surat" }]}
            >
              <Select
                placeholder="Pilih Surat"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {suratList.map((surat) => (
                  <Option key={surat} value={surat}>
                    {surat}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Jumlah Ayat Target"
              name="ayatTarget"
              rules={[{ required: true, message: "Masukkan jumlah ayat target" }]}
            >
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item
              label="Deadline"
              name="deadline"
              rules={[{ required: true, message: "Pilih deadline" }]}
            >
              <DatePicker />
            </Form.Item>
          </Form>
        </Modal>

        {/* FAB */}
        <FloatButton
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          tooltip="Tambah Target Hafalan"
        />
      </div>
    </LayoutApp>
  );
}