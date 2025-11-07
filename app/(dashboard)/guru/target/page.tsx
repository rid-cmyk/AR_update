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
  Divider,
  Typography,
} from "antd";

const { Title, Text } = Typography;
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

  // Group targets by santri untuk summary
  const getTargetSummaryBySantri = () => {
    const summary: Record<number, {
      santri: Santri;
      totalTarget: number;
      belumCount: number;
      prosesCount: number;
      selesaiCount: number;
      lastTarget: TargetHafalan;
      targetList: TargetHafalan[];
      avgProgress: number;
    }> = {};

    targetList.forEach(target => {
      // Check if santri data exists
      if (!target.santri || !target.santri.id) {
        console.warn('Target without santri data:', target);
        return;
      }

      const santriId = target.santri.id;
      if (!summary[santriId]) {
        summary[santriId] = {
          santri: target.santri,
          totalTarget: 0,
          belumCount: 0,
          prosesCount: 0,
          selesaiCount: 0,
          lastTarget: target,
          targetList: [],
          avgProgress: 0
        };
      }
      
      summary[santriId].totalTarget++;
      summary[santriId].targetList.push(target);
      
      if (target.status === 'belum') {
        summary[santriId].belumCount++;
      } else if (target.status === 'proses') {
        summary[santriId].prosesCount++;
      } else {
        summary[santriId].selesaiCount++;
      }
      
      // Update last target if this one is more recent
      if (new Date(target.deadline) > new Date(summary[santriId].lastTarget.deadline)) {
        summary[santriId].lastTarget = target;
      }
    });

    // Calculate average progress for each santri
    Object.values(summary).forEach(s => {
      const totalProgress = s.targetList.reduce((sum, t) => sum + (t.progress || 0), 0);
      s.avgProgress = s.targetList.length > 0 ? Math.round(totalProgress / s.targetList.length) : 0;
    });

    return Object.values(summary);
  };

  const columns = [
    {
      title: "Nama Santri",
      key: "santri",
      render: (record: TargetHafalan) => {
        // Handle missing santri data
        if (!record.santri || !record.santri.namaLengkap) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                ?
              </div>
              <div>
                <div className="font-semibold text-gray-800">Data Santri Tidak Ditemukan</div>
                <div className="text-sm text-red-500">ID: {record.santriId || 'Unknown'}</div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              {record.santri.namaLengkap[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{record.santri.namaLengkap}</div>
              <div className="text-sm text-gray-500">@{record.santri.username || 'No username'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Target Surat",
      key: "surat",
      render: (record: TargetHafalan) => (
        <div>
          <div className="font-medium text-gray-800">{record.surat}</div>
          <div className="text-sm text-gray-500">{record.ayatTarget} ayat target</div>
        </div>
      ),
    },
    {
      title: "Deadline & Status",
      key: "deadline",
      render: (record: TargetHafalan) => {
        return (
          <div>
            <div className="font-medium text-gray-800 mb-1">
              {dayjs(record.deadline).format("DD MMM YYYY")}
            </div>
            <Tag 
              color={getStatusColor(record.status)}
              className="px-2 py-1 rounded-full font-medium"
            >
              {record.status === 'belum' ? '⏳ Belum' : 
               record.status === 'proses' ? '🔄 Proses' : '✅ Selesai'}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: TargetHafalan) => {
        const progress = record.progress || 0;
        return (
          <div className="w-24">
            <Progress 
              percent={progress} 
              size="small" 
              strokeColor={
                progress >= 80 ? '#52c41a' : 
                progress >= 50 ? '#faad14' : '#ff4d4f'
              }
            />
            <div className="text-xs text-center mt-1 text-gray-500">
              {progress}%
            </div>
          </div>
        );
      },
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
            className="text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTarget(record.id)}
            className="text-red-600 hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 600;
          border: none;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f0fdf4 !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
          padding: 16px;
        }
      `}</style>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-2xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎯 Target Hafalan Santri</h1>
              <p className="text-green-100 text-lg">Kelola dan pantau target hafalan santri di halaqah Anda</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              size="large"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-lg"
            >
              Tambah Target
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">{targetList.length}</div>
              <div className="text-gray-600">Total Target</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {targetList.filter(t => t.status === 'belum').length}
              </div>
              <div className="text-gray-600">Belum Dimulai</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {targetList.filter(t => t.status === 'proses').length}
              </div>
              <div className="text-gray-600">Sedang Proses</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {targetList.filter(t => t.status === 'selesai').length}
              </div>
              <div className="text-gray-600">Selesai</div>
            </Card>
          </Col>
        </Row>

        {/* Summary Cards per Santri */}
        {targetList.length > 0 && (
          <Card title="📊 Ringkasan Target per Santri" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {getTargetSummaryBySantri().map((summary) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={summary.santri.id}>
                  <Card 
                    size="small" 
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white'
                    }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-white">
                          {summary.santri.namaLengkap[0]}
                        </span>
                      </div>
                      <div className="font-bold text-lg mb-2">{summary.santri.namaLengkap}</div>
                      <div className="text-sm opacity-90 mb-3">@{summary.santri.username}</div>
                      
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-lg font-bold">{summary.totalTarget}</div>
                          <div className="text-xs opacity-90">Total</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-lg font-bold">{summary.belumCount}</div>
                          <div className="text-xs opacity-90">Belum</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-lg font-bold">{summary.prosesCount}</div>
                          <div className="text-xs opacity-90">Proses</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-lg font-bold">{summary.selesaiCount}</div>
                          <div className="text-xs opacity-90">Selesai</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-2 mb-2">
                        <div className="text-xs opacity-90 mb-1">Progress Rata-rata:</div>
                        <div className="text-xl font-bold">{summary.avgProgress}%</div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-xs opacity-90 mb-1">Target Terdekat:</div>
                        <div className="font-medium text-sm">
                          {summary.lastTarget.surat}
                        </div>
                        <div className="text-xs opacity-75">
                          {dayjs(summary.lastTarget.deadline).format('DD MMM YYYY')}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Enhanced Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Cari nama santri..."
                prefix={<UserOutlined />}
                value={filters.santriName}
                onChange={(e) => setFilters(prev => ({ ...prev, santriName: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Cari surat..."
                prefix={<BookOutlined />}
                value={filters.surat}
                onChange={(e) => setFilters(prev => ({ ...prev, surat: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Filter status"
                style={{ width: '100%' }}
                value={filters.status || undefined}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                allowClear
              >
                <Option value="belum">⏳ Belum</Option>
                <Option value="proses">🔄 Proses</Option>
                <Option value="selesai">✅ Selesai</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card title="📋 Detail Target Hafalan" className="shadow-md">
          <Table
            columns={columns}
            dataSource={targetList}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} target`,
            }}
            className="custom-table"
          />
        </Card>

        {/* Enhanced Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">
                  {editingTarget ? "Edit Target Hafalan" : "Tambah Target Hafalan"}
                </div>
                <div className="text-sm text-gray-500">
                  {editingTarget ? "Perbarui target hafalan santri" : "Buat target hafalan baru untuk santri"}
                </div>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveTarget}
          okText="💾 Simpan Target"
          cancelText="❌ Batal"
          width={600}
          className="custom-modal"
        >
          <Divider />
          <Form form={form} layout="vertical" className="space-y-4">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <UserOutlined className="text-blue-500" />
                      Pilih Santri
                    </span>
                  }
                  name="santriId"
                  rules={[{ required: true, message: "Pilih santri terlebih dahulu" }]}
                >
                  <Select 
                    placeholder="🔍 Cari dan pilih santri dari halaqah Anda"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {santriList.map((santri) => (
                      <Option key={santri.id} value={santri.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {santri.namaLengkap[0]}
                          </div>
                          <span>{santri.namaLengkap}</span>
                          <span className="text-gray-400 text-sm">@{santri.username}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <BookOutlined className="text-green-500" />
                      Surat Target
                    </span>
                  }
                  name="surat"
                  rules={[{ required: true, message: "Pilih surat target" }]}
                >
                  <Select
                    placeholder="📖 Pilih surat yang akan dihafal"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {suratList.map((surat) => (
                      <Option key={surat.nomor} value={surat.namaLatin}>
                        <div className="flex justify-between items-center">
                          <span>{surat.nomor}. {surat.namaLatin}</span>
                          <span className="text-gray-400 text-sm">({surat.jumlahAyat} ayat)</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      📊 Jumlah Ayat
                    </span>
                  }
                  name="ayatTarget"
                  rules={[{ required: true, message: "Masukkan jumlah ayat" }]}
                >
                  <Input 
                    type="number" 
                    min={1} 
                    size="large"
                    placeholder="Contoh: 10"
                    suffix="ayat"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      📅 Deadline Target
                    </span>
                  }
                  name="deadline"
                  rules={[{ required: true, message: "Pilih deadline target" }]}
                >
                  <DatePicker 
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Pilih tanggal deadline"
                    format="DD MMMM YYYY"
                  />
                </Form.Item>
              </Col>
              {editingTarget && (
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2 font-medium text-gray-700">
                        🏷️ Status Target
                      </span>
                    }
                    name="status"
                  >
                    <Select placeholder="Pilih status target" size="large">
                      <Option value="belum">
                        <span className="flex items-center gap-2">
                          ⏳ <span>Belum Dimulai</span>
                        </span>
                      </Option>
                      <Option value="proses">
                        <span className="flex items-center gap-2">
                          🔄 <span>Sedang Proses</span>
                        </span>
                      </Option>
                      <Option value="selesai">
                        <span className="flex items-center gap-2">
                          ✅ <span>Selesai</span>
                        </span>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>

            {!editingTarget && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-lg">💡</div>
                  <div>
                    <div className="font-medium text-blue-800 mb-1">Tips Membuat Target:</div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Pilih target yang realistis sesuai kemampuan santri</li>
                      <li>• Berikan deadline yang cukup untuk menghafal dengan baik</li>
                      <li>• Monitor progress secara berkala</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </Modal>


      </div>
    </LayoutApp>
  );
}