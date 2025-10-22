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
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
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
  status: "belum" | "proses" | "selesai";
  progress?: number; // calculated field
}

export default function TargetHafalanPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [targetList, setTargetList] = useState<TargetHafalan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetHafalan | null>(null);
  const [filters, setFilters] = useState({
    santriName: '',
    surat: '',
    status: ''
  });

  const [form] = Form.useForm();

  const [suratList, setSuratList] = useState<Array<{nomor: number, nama: string, namaLatin: string, jumlahAyat: number}>>([]);

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/guru/dashboard");
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

  // Fetch target hafalan dengan filtering
  const fetchTargets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.santriName) params.append('santriName', filters.santriName);
      if (filters.surat) params.append('surat', filters.surat);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`/api/guru/target?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTargetList(data.data || []);
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

  // Fetch surat list from Quran API
  const fetchSuratList = async () => {
    try {
      const response = await fetch('/api/quran');
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setSuratList(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching surat list:', error);
    }
  };

  useEffect(() => {
    fetchHalaqah();
    fetchSuratList();
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [filters]);

  const handleSaveTarget = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        santriId: values.santriId,
        surat: values.surat,
        ayatTarget: values.ayatTarget,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: values.status || "belum"
      };

      const url = editingTarget ? `/api/guru/target/${editingTarget.id}` : "/api/guru/target";
      const method = editingTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        message.success(data.message || (editingTarget ? "Target berhasil diperbarui" : "Target berhasil ditambahkan"));
        setIsModalOpen(false);
        form.resetFields();
        fetchTargets();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menyimpan target");
      }
    } catch (error) {
      console.error("Error saving target:", error);
      message.error("Terjadi kesalahan saat menyimpan target");
    }
  };

  const handleDeleteTarget = async (id: number) => {
    try {
      const res = await fetch(`/api/guru/target/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        message.success(data.message || "Target berhasil dihapus");
        fetchTargets();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menghapus target");
      }
    } catch (error) {
      console.error("Error deleting target:", error);
      message.error("Terjadi kesalahan saat menghapus target");
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
      case "selesai": return "green";
      case "proses": return "orange";
      case "belum": return "blue";
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
        <Tag color={getStatusColor(status)}>
          {status === 'belum' ? 'Belum' : status === 'proses' ? 'Proses' : 'Selesai'}
        </Tag>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Target Hafalan</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Tambah Target
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Input
                placeholder="Cari nama santri..."
                prefix={<UserOutlined />}
                value={filters.santriName}
                onChange={(e) => setFilters(prev => ({ ...prev, santriName: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Input
                placeholder="Cari surat..."
                prefix={<BookOutlined />}
                value={filters.surat}
                onChange={(e) => setFilters(prev => ({ ...prev, surat: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter status"
                style={{ width: '100%' }}
                value={filters.status || undefined}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                allowClear
              >
                <Option value="belum">Belum</Option>
                <Option value="proses">Proses</Option>
                <Option value="selesai">Selesai</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                <FilterOutlined />
                <span>Total: {targetList.length} target</span>
              </div>
            </Col>
          </Row>
        </Card>

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
                  <Option key={surat.nomor} value={surat.namaLatin}>
                    {surat.nomor}. {surat.namaLatin} ({surat.jumlahAyat} ayat)
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
            {editingTarget && (
              <Form.Item
                label="Status"
                name="status"
              >
                <Select placeholder="Pilih Status">
                  <Option value="belum">Belum</Option>
                  <Option value="proses">Proses</Option>
                  <Option value="selesai">Selesai</Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>


      </div>
    </LayoutApp>
  );
}