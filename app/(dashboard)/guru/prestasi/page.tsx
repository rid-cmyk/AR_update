"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface Prestasi {
  id: number;
  namaPrestasi: string;
  keterangan: string | null;
  kategori: string | null;
  tahun: number;
  validated: boolean;
  santri: {
    id: number;
    namaLengkap: string;
    username: string;
  };
}

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

export default function PrestasiPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [form] = Form.useForm();

  // Fetch halaqah milik guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/guru/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        if (data.halaqah && data.halaqah.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(data.halaqah[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch prestasi data
  const fetchPrestasiData = async () => {
    if (!selectedHalaqah) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/guru/prestasi?halaqahId=${selectedHalaqah}`);
      if (res.ok) {
        const data = await res.json();
        setPrestasiList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching prestasi data:", error);
      setPrestasiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchPrestasiData();
    }
  }, [selectedHalaqah]);

  const handleAdd = () => {
    setEditingPrestasi(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Prestasi) => {
    setEditingPrestasi(record);
    form.setFieldsValue({
      santriId: record.santri.id,
      namaPrestasi: record.namaPrestasi,
      keterangan: record.keterangan,
      kategori: record.kategori,
      tahun: record.tahun,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Hapus Prestasi",
      content: "Apakah Anda yakin ingin menghapus prestasi ini?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(`/api/guru/prestasi/${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            message.success("Prestasi berhasil dihapus");
            fetchPrestasiData();
          } else {
            message.error("Gagal menghapus prestasi");
          }
        } catch (error) {
          console.error("Error deleting prestasi:", error);
          message.error("Error saat menghapus prestasi");
        }
      },
    });
  };

  const handleValidate = async (id: number, validated: boolean) => {
    try {
      const res = await fetch(`/api/guru/prestasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validated }),
      });

      if (res.ok) {
        message.success(`Prestasi berhasil ${validated ? "divalidasi" : "dibatalkan validasinya"}`);
        fetchPrestasiData();
      } else {
        message.error("Gagal mengupdate validasi prestasi");
      }
    } catch (error) {
      console.error("Error validating prestasi:", error);
      message.error("Error saat mengupdate validasi");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingPrestasi
        ? `/api/guru/prestasi/${editingPrestasi.id}`
        : "/api/guru/prestasi";
      
      const method = editingPrestasi ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          halaqahId: selectedHalaqah,
        }),
      });

      if (res.ok) {
        message.success(`Prestasi berhasil ${editingPrestasi ? "diupdate" : "ditambahkan"}`);
        setIsModalOpen(false);
        form.resetFields();
        fetchPrestasiData();
      } else {
        const error = await res.json();
        message.error(error.error || "Gagal menyimpan prestasi");
      }
    } catch (error) {
      console.error("Error saving prestasi:", error);
      message.error("Error saat menyimpan prestasi");
    }
  };

  const getKategoriColor = (kategori: string | null) => {
    switch (kategori?.toLowerCase()) {
      case "akademik": return "blue";
      case "tahfidz": return "green";
      case "olahraga": return "orange";
      case "seni": return "purple";
      case "kepemimpinan": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
      width: 200,
    },
    {
      title: "Nama Prestasi",
      dataIndex: "namaPrestasi",
      key: "namaPrestasi",
      width: 250,
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      width: 120,
      render: (kategori: string | null) => (
        <Tag color={getKategoriColor(kategori)}>
          {kategori || "Umum"}
        </Tag>
      ),
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      width: 100,
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      ellipsis: true,
      render: (text: string | null) => (
        <Tooltip title={text}>
          {text || "-"}
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "validated",
      key: "validated",
      width: 120,
      render: (validated: boolean) => (
        <Tag color={validated ? "success" : "warning"} icon={validated ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {validated ? "Tervalidasi" : "Belum Validasi"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      width: 200,
      render: (record: Prestasi) => (
        <Space size="small">
          {!record.validated && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleValidate(record.id, true)}
            >
              Validasi
            </Button>
          )}
          {record.validated && (
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleValidate(record.id, false)}
            >
              Batal
            </Button>
          )}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const selectedHalaqahData = halaqahList.find(h => h.id === selectedHalaqah);
  const validatedCount = prestasiList.filter(p => p.validated).length;
  const pendingCount = prestasiList.filter(p => !p.validated).length;
  const thisYearCount = prestasiList.filter(p => p.tahun === new Date().getFullYear()).length;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
            <TrophyOutlined style={{ marginRight: 16 }} />
            Manajemen Prestasi Santri
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0', fontSize: '16px' }}>
            Catat dan kelola prestasi santri di halaqah Anda
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Prestasi"
                value={prestasiList.length}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tervalidasi"
                value={validatedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Menunggu Validasi"
                value={pendingCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Prestasi Tahun Ini"
                value={thisYearCount}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter & Actions */}
        <Card style={{ marginBottom: 24 }}>
          <Space>
            <Select
              placeholder="Pilih Halaqah"
              style={{ width: 250 }}
              value={selectedHalaqah}
              onChange={(value) => setSelectedHalaqah(value)}
            >
              {halaqahList.map((halaqah) => (
                <Option key={halaqah.id} value={halaqah.id}>
                  {halaqah.namaHalaqah} ({halaqah.jumlahSantri} santri)
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!selectedHalaqah}
            >
              Tambah Prestasi
            </Button>
          </Space>
        </Card>

        {/* Table */}
        <Card title={`Daftar Prestasi - ${selectedHalaqahData?.namaHalaqah || 'Pilih Halaqah'}`}>
          <Table
            columns={columns}
            dataSource={prestasiList}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} prestasi`,
            }}
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <span>{editingPrestasi ? "Edit Prestasi" : "Tambah Prestasi Baru"}</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="santriId"
              label="Santri"
              rules={[{ required: true, message: "Pilih santri" }]}
            >
              <Select
                placeholder="Pilih santri"
                showSearch
                optionFilterProp="children"
              >
                {selectedHalaqahData?.santri.map((santri) => (
                  <Option key={santri.id} value={santri.id}>
                    {santri.namaLengkap} (@{santri.username})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="namaPrestasi"
              label="Nama Prestasi"
              rules={[{ required: true, message: "Masukkan nama prestasi" }]}
            >
              <Input placeholder="Contoh: Juara 1 Lomba Tahfidz Tingkat Kecamatan" />
            </Form.Item>

            <Form.Item
              name="kategori"
              label="Kategori"
              rules={[{ required: true, message: "Pilih kategori" }]}
            >
              <Select placeholder="Pilih kategori prestasi">
                <Option value="Tahfidz">Tahfidz</Option>
                <Option value="Akademik">Akademik</Option>
                <Option value="Olahraga">Olahraga</Option>
                <Option value="Seni">Seni</Option>
                <Option value="Kepemimpinan">Kepemimpinan</Option>
                <Option value="Lainnya">Lainnya</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="tahun"
              label="Tahun"
              rules={[{ required: true, message: "Masukkan tahun" }]}
              initialValue={new Date().getFullYear()}
            >
              <Input type="number" placeholder="2024" />
            </Form.Item>

            <Form.Item
              name="keterangan"
              label="Keterangan"
            >
              <TextArea
                rows={4}
                placeholder="Deskripsi detail tentang prestasi (opsional)"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}>
                  Batal
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingPrestasi ? "Update" : "Simpan"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
