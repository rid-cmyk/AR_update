"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Select,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LoadingSkeleton from "@/components/layout/LoadingSkeleton";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import AdminHalaqahForm from "@/components/admin/halaqah/AdminHalaqahForm";
import { useRouter } from "next/navigation";
import WebSideDrawer from "@/components/ui/WebSideDrawer";

const DynamicTable = dynamic(() => import("antd").then((mod) => mod.Table), {
  ssr: false,
  loading: () => <LoadingSkeleton type="table" count={5} />,
});


interface Halaqah {
  id: number;
  namaHalaqah: string;
  deskripsi?: string | null;
  guruId?: number | null;
  guru?: {
    id: number;
    namaLengkap: string;
  } | null;
  santri: Array<{
    id: number;
    namaLengkap: string;
  }>;
  jumlahSantri: number;
}

interface Guru {
  id: number;
  namaLengkap: string;
}

interface Santri {
  id: number;
  namaLengkap: string;
}

interface HalaqahClientProps {
  initialHalaqah: Halaqah[];
  guruList: Guru[];
  availableSantriList: Santri[];
}

export default function HalaqahClient({
  initialHalaqah,
  guruList,
  availableSantriList,
}: HalaqahClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);
  const [santriOptions, setSantriOptions] = useState<Santri[]>(availableSantriList);
  const [form] = Form.useForm();

  // Fetch specific santri for editing halaqah
  const fetchSantriForEdit = async (halaqahId: number) => {
    try {
      const res = await fetch(`/api/admin/users/available?halaqahId=${halaqahId}`);
      if (res.ok) {
        const data = await res.json();
        setSantriOptions(data);
      }
    } catch (error) {
      console.error("Error fetching santri for edit:", error);
    }
  };

  const openModal = (halaqah?: Halaqah) => {
    if (halaqah) {
      setEditingHalaqah(halaqah);
      fetchSantriForEdit(halaqah.id);
      form.setFieldsValue({
        ...halaqah,
        guruId: halaqah.guruId,
        santriIds: halaqah.santri?.map((s) => s.id) || [],
      });
    } else {
      setEditingHalaqah(null);
      form.resetFields();
      setSantriOptions(availableSantriList);
      
      setTimeout(() => {
        const firstFiveSantri = availableSantriList.slice(0, 5).map((s) => s.id);
        form.setFieldsValue({
          santriIds: firstFiveSantri,
        });
      }, 100);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!values.santriIds || values.santriIds.length === 0) {
        message.error("Please select at least one santri");
        return;
      }

      setLoading(true);
      const url = editingHalaqah
        ? `/api/halaqah/${editingHalaqah.id}`
        : "/api/halaqah";
      const method = editingHalaqah ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error) {
          message.error(errorData.error);
        } else {
          message.error(`Gagal menyimpan halaqah (${res.status})`);
        }
        return;
      }

      message.success(
        editingHalaqah
          ? "Halaqah berhasil diperbarui"
          : "Halaqah berhasil ditambahkan"
      );
      setIsModalOpen(false);
      form.resetFields();
      router.refresh(); // Refresh Server Components data
    } catch (error: unknown) {
      console.error("Error saving halaqah:", error);
      message.error(
        error instanceof Error ? error.message : "Error saving halaqah"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/halaqah/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete halaqah");
      }

      message.success("Halaqah berhasil dihapus");
      router.refresh(); // Refresh Server Components data
    } catch (error: unknown) {
      console.error("Error deleting halaqah:", error);
      message.error(
        error instanceof Error ? error.message : "Error deleting halaqah"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nama Halaqah",
      dataIndex: "namaHalaqah",
      key: "namaHalaqah",
      render: (text: string, record: any) => {
        return (
          <div>
            <div style={{ fontWeight: "bold" }}>{text}</div>
            {record.deskripsi && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                {record.deskripsi}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Guru Pengampu",
      dataIndex: "guru",
      key: "guru",
      render: (guru: any) => {
        return guru?.namaLengkap || "Belum ditentukan";
      },
    },
    {
      title: "Jumlah Santri",
      dataIndex: "jumlahSantri",
      key: "santriCount",
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: any) => {
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              size="small"
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this halaqah?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ padding: "24px 0" }}>
        <AdminHeaderCard
          title="Halaqah Management"
          subtitle="Kelola kelompok belajar dan alokasi guru"
        />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined
                  style={{ fontSize: "24px", color: "#219ebc", marginRight: 12 }}
                />
                <div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Total Halaqah
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#219ebc",
                    }}
                  >
                    {initialHalaqah.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: "flex", alignItems: "center" }}>
                <UserOutlined
                  style={{ fontSize: "24px", color: "#219ebc", marginRight: 12 }}
                />
                <div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Total Guru
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#219ebc",
                    }}
                  >
                    {guruList.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined
                  style={{ fontSize: "24px", color: "#8ecae6", marginRight: 12 }}
                />
                <div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Santri Tersedia
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#8ecae6",
                    }}
                  >
                    {availableSantriList.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title="Halaqah List"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Add Halaqah
            </Button>
          }
        >
          <DynamicTable
            dataSource={initialHalaqah}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>

        {/* Zero Code Duplication Helper for Halaqah Form */}
        {(() => {
          const renderHalaqahFormContent = () => (
            <AdminHalaqahForm form={form} guruOptions={guruList} santriOptions={santriOptions} />
          );

          return (
            <>
              {/* Mobile Modal (< 1024px) */}
              <Modal
                title={
                  <Space>
                    <TeamOutlined />
                    {editingHalaqah ? "Edit Halaqah" : "Add New Halaqah"}
                  </Space>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSave}
                okText="Save"
                width={600}
                className="lg:hidden"
              >
                {renderHalaqahFormContent()}
              </Modal>

              {/* Desktop Web Side Drawer (>= 1024px) */}
              <WebSideDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingHalaqah ? "Edit Halaqah" : "Tambah Halaqah Baru"}
                subtitle="Kelola nama halaqah, guru pengampu, dan daftar santri (minimal 5 santri)"
                size="lg"
                footer={
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
                    <Button type="primary" onClick={handleSave}>Simpan</Button>
                  </div>
                }
              >
                {renderHalaqahFormContent()}
              </WebSideDrawer>
            </>
          );
        })()}
      </div>
    </>
  );
}
