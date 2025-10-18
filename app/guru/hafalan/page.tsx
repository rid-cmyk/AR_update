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
  Tag,
  FloatButton,
  message,
  Typography,
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

interface Hafalan {
  id: number;
  santri: Santri;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  jenis: "ziyadah" | "murojaah";
  status: string;
  tanggal: string;
}

export default function DataHafalanPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [hafalanList, setHafalanList] = useState<Hafalan[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHafalan, setEditingHafalan] = useState<Hafalan | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());

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

  // Fetch hafalan berdasarkan tanggal
  const fetchHafalan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hafalan?tanggal=${selectedDate.format('YYYY-MM-DD')}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanList(data);
      }
    } catch (error) {
      console.error("Error fetching hafalan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get santri list for modal form - all santri taught by guru
  const getModalSantriList = () => {
    return santriList;
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    fetchHafalan();
  }, [selectedDate]);

  const handleSaveHafalan = async () => {
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
        santriId: values.santriId,
        surat: values.surat,
        ayatMulai: values.ayatMulai,
        ayatSelesai: values.ayatSelesai,
        jenis: values.jenis,
        tanggal: selectedDate.format('YYYY-MM-DD'),
        halaqahId,
      };

      const url = editingHafalan ? `/api/hafalan/${editingHafalan.id}` : "/api/hafalan";
      const method = editingHafalan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(editingHafalan ? "Hafalan berhasil diperbarui" : "Hafalan berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        fetchHafalan();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menyimpan hafalan");
      }
    } catch (error) {
      console.error("Error saving hafalan:", error);
      message.error("Terjadi kesalahan saat menyimpan hafalan");
    }
  };

  const handleDeleteHafalan = async (id: number) => {
    try {
      const res = await fetch(`/api/hafalan/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Hafalan berhasil dihapus");
        fetchHafalan();
      } else {
        message.error("Gagal menghapus hafalan");
      }
    } catch (error) {
      console.error("Error deleting hafalan:", error);
    }
  };

  const openModal = (hafalan?: Hafalan) => {
    if (hafalan) {
      setEditingHafalan(hafalan);
      form.setFieldsValue(hafalan);
    } else {
      setEditingHafalan(null);
      form.resetFields();
    }
    setIsModalOpen(true);
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
      title: "Ayat (Mulai–Selesai)",
      key: "ayat",
      render: (record: Hafalan) => `${record.ayatMulai}–${record.ayatSelesai}`,
    },
    {
      title: "Jenis",
      dataIndex: "jenis",
      key: "jenis",
      render: (jenis: string) => (
        <Tag color={jenis === 'ziyadah' ? 'green' : 'blue'}>
          {jenis === 'ziyadah' ? 'Ziyadah' : 'Murojaah'}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: Hafalan) => (
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
            onClick={() => handleDeleteHafalan(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Data Hafalan</h1>

        {/* Date Picker */}
        <Space style={{ marginBottom: 16 }}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date || dayjs())}
            disabled={halaqahList.length === 0}
          />
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={hafalanList}
          rowKey="id"
          loading={loading}
        />

        {/* Modal */}
        <Modal
          title={editingHafalan ? "Edit Hafalan" : "Tambah Hafalan"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveHafalan}
          okText="Simpan"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Santri"
              name="santriId"
              rules={[{ required: true, message: "Pilih santri" }]}
            >
              <Select placeholder="Pilih Santri dari halaqah Anda">
                {getModalSantriList().map((santri) => (
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
            <Space>
              <Form.Item
                label="Ayat Mulai"
                name="ayatMulai"
                rules={[{ required: true, message: "Masukkan ayat mulai" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item
                label="Ayat Selesai"
                name="ayatSelesai"
                rules={[{ required: true, message: "Masukkan ayat selesai" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Space>
            <Form.Item
              label="Jenis Hafalan"
              name="jenis"
              rules={[{ required: true, message: "Pilih jenis hafalan" }]}
            >
              <Select placeholder="Pilih Jenis">
                <Option value="ziyadah">Ziyadah</Option>
                <Option value="murojaah">Murojaah</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* FAB */}
        <FloatButton
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          tooltip="Tambah Hafalan"
        />
      </div>
    </LayoutApp>
  );
}