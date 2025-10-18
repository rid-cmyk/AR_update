"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Space,
  Tag,
  FloatButton,
  message,
  Slider,
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

interface Ujian {
  id: number;
  santri: Santri;
  jenis: "tasmi" | "uas";
  nilai: number;
  tanggal: string;
}

export default function UjianPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUjian, setEditingUjian] = useState<Ujian | null>(null);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<string>("");
  const [selectedTanggal, setSelectedTanggal] = useState(dayjs());

  const [form] = Form.useForm();

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/(guru)/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Auto-select first halaqah if available
        if (data.halaqah && data.halaqah.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(data.halaqah[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch santri berdasarkan halaqah yang dipilih
  const fetchSantri = async (halaqahId: number) => {
    try {
      // Find santri from halaqah data that was already fetched
      const selectedHalaqahData = halaqahList.find(h => h.id === halaqahId);
      if (selectedHalaqahData && selectedHalaqahData.santri) {
        setSantriList(selectedHalaqahData.santri);
      } else {
        setSantriList([]);
      }
    } catch (error) {
      console.error("Error fetching santri:", error);
      setSantriList([]);
    }
  };

  // Fetch ujian berdasarkan filter
  const fetchUjian = async () => {
    if (!selectedHalaqah || !selectedJenis) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        halaqahId: selectedHalaqah.toString(),
        jenis: selectedJenis,
        tanggal: selectedTanggal.format('YYYY-MM-DD'),
      });

      const res = await fetch(`/api/ujian?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUjianList(data);
      }
    } catch (error) {
      console.error("Error fetching ujian:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchSantri(selectedHalaqah);
    }
  }, [selectedHalaqah]);

  useEffect(() => {
    fetchUjian();
  }, [selectedHalaqah, selectedJenis, selectedTanggal]);

  const handleSaveUjian = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        halaqahId: selectedHalaqah,
        jenis: selectedJenis,
        tanggal: selectedTanggal.format('YYYY-MM-DD'),
      };

      const url = editingUjian ? `/api/ujian/${editingUjian.id}` : "/api/ujian";
      const method = editingUjian ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(editingUjian ? "Nilai berhasil diperbarui" : "Nilai berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        fetchUjian();
      } else {
        message.error("Gagal menyimpan nilai");
      }
    } catch (error) {
      console.error("Error saving ujian:", error);
    }
  };

  const handleDeleteUjian = async (id: number) => {
    try {
      const res = await fetch(`/api/ujian/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Nilai berhasil dihapus");
        fetchUjian();
      } else {
        message.error("Gagal menghapus nilai");
      }
    } catch (error) {
      console.error("Error deleting ujian:", error);
    }
  };

  const openModal = (ujian?: Ujian) => {
    if (ujian) {
      setEditingUjian(ujian);
      form.setFieldsValue(ujian);
    } else {
      setEditingUjian(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 90) return "gold";
    if (nilai >= 85) return "green";
    if (nilai >= 70) return "orange";
    return "red";
  };

  const getNilaiStars = (nilai: number) => {
    if (nilai >= 90) return "⭐⭐⭐⭐⭐";
    if (nilai >= 85) return "⭐⭐⭐⭐";
    if (nilai >= 80) return "⭐⭐⭐⭐";
    if (nilai >= 75) return "⭐⭐⭐";
    if (nilai >= 70) return "⭐⭐";
    return "⭐";
  };

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
    },
    {
      title: "Jenis Ujian",
      dataIndex: "jenis",
      key: "jenis",
      render: (jenis: string) => (
        <Tag color={jenis === 'tasmi' ? 'blue' : 'purple'}>
          {jenis === 'tasmi' ? 'Tasmi' : 'UAS'}
        </Tag>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Nilai",
      dataIndex: "nilai",
      key: "nilai",
      render: (nilai: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: "bold", color: getNilaiColor(nilai) }}>
            {nilai}
          </span>
          <span>{getNilaiStars(nilai)}</span>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: Ujian) => (
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
            onClick={() => handleDeleteUjian(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Penilaian Ujian</h1>

        {/* Filter Controls */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Jenis Ujian"
            style={{ width: 150 }}
            value={selectedJenis}
            onChange={(value) => setSelectedJenis(value)}
            disabled={halaqahList.length === 0}
          >
            <Option value="tasmi">Tasmi</Option>
            <Option value="uas">UAS</Option>
          </Select>
          <DatePicker
            value={selectedTanggal}
            onChange={(date) => setSelectedTanggal(date || dayjs())}
            disabled={halaqahList.length === 0}
          />
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={ujianList}
          rowKey="id"
          loading={loading}
        />

        {/* Modal */}
        <Modal
          title={editingUjian ? "Edit Nilai Ujian" : "Tambah Nilai Ujian"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveUjian}
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
              label="Nilai"
              name="nilai"
              rules={[
                { required: true, message: "Masukkan nilai" },
                { type: "number", min: 0, max: 100, message: "Nilai harus antara 0-100" }
              ]}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder="0-100"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* FAB */}
        <FloatButton
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          tooltip="Tambah Nilai Ujian"
        />
      </div>
    </LayoutApp>
  );
}