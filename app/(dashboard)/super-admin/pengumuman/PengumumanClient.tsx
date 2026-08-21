 
"use client";

import React, { useState, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Select,
  DatePicker,
  Table,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { useResourceCRUD } from "@/hooks";
import type { ColumnsType } from "antd/es/table";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tanggalKadaluarsa?: string;
  targetAudience: string;
  creator: {
    id: number;
    namaLengkap: string;
    role: {
      name: string;
    };
  };
  isRead?: boolean;
  readCount?: number;
  readDetails?: {
    userId: number;
    userName: string;
    userRole: string;
    readAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface PengumumanClientProps {
  initialPengumuman: Pengumuman[];
}

const audienceOptions = [
  { value: "semua", label: "Semua User", color: "#219ebc" },
  { value: "santri", label: "Santri", color: "#ffb703" },
  { value: "guru", label: "Guru", color: "#219ebc" },
  { value: "ortu", label: "Orang Tua", color: "#8ecae6" },
  { value: "yayasan", label: "Yayasan", color: "#ffb703" },
  { value: "super_admin", label: "Super Admin", color: "#fb8500" },
];

export default function PengumumanClient({ initialPengumuman }: PengumumanClientProps) {
  const {
    data: pengumuman,
    loading,
    isModalOpen,
    editingItem: editingPengumuman,
    openModal: openModalInternal,
    closeModal: setIsModalOpen,
    save: handleSaveInternal,
    remove: handleDelete,
  } = useResourceCRUD<Pengumuman>({
    endpoint: '/api/pengumuman',
    initialData: initialPengumuman,
    successMessages: {
      create: 'Pengumuman berhasil ditambahkan',
      update: 'Pengumuman berhasil diperbarui',
      delete: 'Pengumuman berhasil dihapus',
    },
  });

  const [form] = Form.useForm();

  const openModal = (p?: Pengumuman) => {
    if (p) {
      form.setFieldsValue({
        judul: p.judul,
        isi: p.isi,
        targetAudience: p.targetAudience,
        tanggalKadaluarsa: p.tanggalKadaluarsa ? dayjs(p.tanggalKadaluarsa) : null,
      });
    } else {
      form.resetFields();
    }
    openModalInternal(p);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        judul: values.judul,
        isi: values.isi,
        targetAudience: values.targetAudience || 'semua',
        tanggalKadaluarsa: values.tanggalKadaluarsa ? values.tanggalKadaluarsa.toISOString() : null
      };

      await handleSaveInternal(payload);
    } catch (error: unknown) {
      console.error("Error validation pengumuman:", error);
    }
  };

  const columns: ColumnsType<Pengumuman> = [
    {
      title: "Pengumuman",
      key: "pengumuman",
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            📢
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 truncate">{record.judul}</div>
            <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
              {record.isi.length > 80 ? `${record.isi.substring(0, 80)}...` : record.isi}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {dayjs(record.tanggal).format("DD MMM YYYY")} · {record.creator?.namaLengkap || "-"}
              {record.readCount ? ` · ${record.readCount} dibaca` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Target",
      dataIndex: "targetAudience",
      key: "target",
      width: 120,
      render: (val: string) => {
        const option = audienceOptions.find((opt) => opt.value === val);
        return (
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: (option?.color || "#999") + "18",
              border: `1px solid ${(option?.color || "#999")}35`,
              color: option?.color || "#999",
            }}
          >
            {option?.label || val}
          </span>
        );
      },
    },
    {
      title: "Kadaluarsa",
      key: "kadaluarsa",
      width: 110,
      render: (_, record) => {
        if (!record.tanggalKadaluarsa) return <span className="text-xs text-gray-400">-</span>;
        const isExpired = dayjs(record.tanggalKadaluarsa).isBefore(dayjs());
        return (
          <span className={`text-xs ${isExpired ? "text-red-500 font-medium" : "text-gray-500"}`}>
            {dayjs(record.tanggalKadaluarsa).format("DD/MM/YY")}
          </span>
        );
      },
    },
    {
      title: "Aksi",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Hapus pengumuman ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px 0" }}>
      <AdminHeaderCard
        title="Pengumuman"
        subtitle="Buat dan kelola pengumuman untuk berbagai grup pengguna"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Tambah Pengumuman
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{pengumuman.length}</div>
            <div className="text-gray-500 text-sm">Total</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {pengumuman.filter((p) => dayjs(p.tanggal).isAfter(dayjs().startOf("month"))).length}
            </div>
            <div className="text-gray-500 text-sm">Bulan Ini</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">
              {pengumuman.filter((p) => dayjs(p.tanggal).isAfter(dayjs().startOf("week"))).length}
            </div>
            <div className="text-gray-500 text-sm">Minggu Ini</div>
          </Card>
        </Col>
      </Row>

      <Card title="Daftar Pengumuman">
        <Table
          dataSource={pengumuman}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
          }}
        />
      </Card>

      {/* Zero Code Duplication Helper for Pengumuman Form */}
      {(() => {
        const renderPengumumanFormContent = () => (
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="Judul Pengumuman"
              name="judul"
              rules={[{ required: true, message: "Masukkan judul pengumuman" }]}
            >
              <Input placeholder="Contoh: Libur Hari Raya Idul Fitri" />
            </Form.Item>

            <Form.Item
              label="Isi Pengumuman"
              name="isi"
              rules={[{ required: true, message: "Masukkan isi pengumuman" }]}
            >
              <Input.TextArea rows={5} placeholder="Tulis isi pengumuman..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Target Audience"
                  name="targetAudience"
                  rules={[{ required: true, message: "Pilih target audience" }]}
                >
                  <Select placeholder="Pilih penerima">
                    {audienceOptions.map((opt) => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tanggal Kadaluarsa" name="tanggalKadaluarsa">
                  <DatePicker format="DD/MM/YYYY" placeholder="Opsional" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

        return (
          <>
            {/* Mobile Modal (< 1024px) */}
            <Modal
              title={editingPengumuman ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
              open={isModalOpen}
              onCancel={() => setIsModalOpen()}
              onOk={handleSave}
              okText="Simpan"
              cancelText="Batal"
              width={700}
              destroyOnHidden
              className="lg:hidden"
            >
              {renderPengumumanFormContent()}
            </Modal>

            {/* Desktop WebSideDrawer (>= 1024px) */}
            <WebSideDrawer
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen()}
              title={editingPengumuman ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
              subtitle="Buat atau edit pengumuman untuk sasaran pengguna (Santri, Guru, Ortu, atau Semua)"
              size="lg"
              footer={
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setIsModalOpen()}>Batal</Button>
                  <Button type="primary" onClick={handleSave}>Simpan</Button>
                </div>
              }
            >
              {renderPengumumanFormContent()}
            </WebSideDrawer>
          </>
        );
      })()}
    </div>
  );
}
