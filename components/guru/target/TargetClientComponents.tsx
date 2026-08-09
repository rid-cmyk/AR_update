"use client";

import { useState } from 'react';
import { Button, message, Space, Modal, Form } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import TargetFormModal from './TargetFormModal';
import TargetSummaryCards, { TargetSummaryItem } from './TargetSummaryCards';

export function TargetActionButtons({ santriOptions }: { santriOptions: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleSave = async (values: any) => {
    try {
      const payload = {
        santriId: values.santriId,
        surat: values.surat,
        ayatTarget: values.ayatTarget,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: values.status || "belum"
      };

      const res = await fetch("/api/guru/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Target berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        router.refresh();
      } else {
        message.error("Gagal menambahkan target");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan");
    }
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        form.resetFields();
        setIsModalOpen(true);
      }}>
        Buat Target Baru
      </Button>
      <TargetFormModal 
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        form={form}
        santriList={santriOptions}
        handleSaveTarget={() => form.validateFields().then(handleSave)}
        suratList={[]}
        editingTarget={null}
      />
    </>
  );
}

import dayjs from 'dayjs';

export function TargetRowActions({ target, santriOptions }: { target: any, santriOptions: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleDelete = async () => {
    Modal.confirm({
      title: "Hapus Target",
      content: "Apakah Anda yakin ingin menghapus target ini?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => {
        const res = await fetch(`/api/guru/target/${target.id}`, { method: "DELETE" });
        if (res.ok) {
          message.success("Target berhasil dihapus");
          router.refresh();
        } else {
          message.error("Gagal menghapus target");
        }
      }
    });
  };

  const handleUpdate = async (values: any) => {
    try {
      const payload = {
        santriId: values.santriId,
        surat: values.surat,
        ayatTarget: values.ayatTarget,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: values.status || "belum"
      };

      const res = await fetch(`/api/guru/target/${target.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Target berhasil diupdate");
        setIsModalOpen(false);
        router.refresh();
      } else {
        message.error("Gagal mengupdate target");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan");
    }
  };

  return (
    <Space>
      <Button type="text" icon={<EditOutlined />} className="text-blue-600 hover:bg-blue-50" onClick={() => {
        form.setFieldsValue({
          ...target,
          deadline: dayjs(target.deadline)
        });
        setIsModalOpen(true);
      }} />
      <Button type="text" danger icon={<DeleteOutlined />} className="text-red-600 hover:bg-red-50" onClick={handleDelete} />
      
      <TargetFormModal 
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        form={form}
        santriList={santriOptions}
        handleSaveTarget={() => form.validateFields().then(handleUpdate)}
        suratList={[]}
        editingTarget={target}
      />
    </Space>
  );
}

// Re-export Server-safe Summary wrapper
export function TargetSummaryWrapper({ targets, summaries }: { targets: number, summaries: TargetSummaryItem[] }) {
  return <TargetSummaryCards targetListLength={targets} summaries={summaries} />;
}
