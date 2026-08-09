"use client";

import { useState } from 'react';
import { Button, message, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PrestasiFormModal from './PrestasiFormModal';
import { useRouter } from 'next/navigation';

export default function PrestasiActionButtons({ halaqahId, halaqahData }: { halaqahId: number | null, halaqahData: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const url = "/api/guru/prestasi";
      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          halaqahId: halaqahId,
        }),
      });

      if (res.ok) {
        message.success("Prestasi berhasil ditambahkan");
        setIsModalOpen(false);
        form.resetFields();
        router.refresh();
      } else {
        const error = await res.json();
        message.error(error.error || "Gagal menyimpan prestasi");
      }
    } catch (error) {
      console.error("Error saving prestasi:", error);
      message.error("Error saat menyimpan prestasi");
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={() => {
          form.resetFields();
          setIsModalOpen(true);
        }}
        disabled={!halaqahId}
      >
        Tambah Prestasi
      </Button>

      <PrestasiFormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        handleSubmit={handleSubmit}
        selectedHalaqahData={halaqahData}
        editingPrestasi={null}
      />
    </>
  );
}
