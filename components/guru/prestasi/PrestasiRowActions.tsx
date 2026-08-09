"use client";

import { useState } from 'react';
import { Button, message, Space, Modal, Form } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PrestasiFormModal from './PrestasiFormModal';

export default function PrestasiRowActions({ 
  prestasi, 
  halaqahId,
  halaqahData
}: { 
  prestasi: any; 
  halaqahId: number;
  halaqahData: any;
}) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleValidate = async (id: number, validated: boolean) => {
    try {
      const res = await fetch(`/api/guru/prestasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validated }),
      });

      if (res.ok) {
        message.success(`Prestasi berhasil ${validated ? "divalidasi" : "dibatalkan validasinya"}`);
        router.refresh();
      } else {
        message.error("Gagal mengupdate validasi prestasi");
      }
    } catch (error) {
      console.error("Error validating prestasi:", error);
      message.error("Error saat mengupdate validasi");
    }
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
            router.refresh();
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

  const handleEditSubmit = async (values: any) => {
    try {
      const url = `/api/guru/prestasi/${prestasi.id}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          halaqahId,
        }),
      });

      if (res.ok) {
        message.success("Prestasi berhasil diupdate");
        setIsEditModalOpen(false);
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
    <Space size="small">
      {!prestasi.validated && (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleValidate(prestasi.id, true)}
        >
          Validasi
        </Button>
      )}
      {prestasi.validated && (
        <Button
          size="small"
          icon={<CloseCircleOutlined />}
          onClick={() => handleValidate(prestasi.id, false)}
        >
          Batal Validasi
        </Button>
      )}
      <Button
        size="small"
        icon={<EditOutlined />}
        onClick={() => {
          form.setFieldsValue({
            santriId: prestasi.santri.id,
            namaPrestasi: prestasi.namaPrestasi,
            keterangan: prestasi.keterangan,
            kategori: prestasi.kategori,
            tahun: prestasi.tahun,
          });
          setIsEditModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(prestasi.id)}
      >
        Hapus
      </Button>

      {/* Modal Edit */}
      <PrestasiFormModal
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        form={form}
        handleSubmit={handleEditSubmit}
        selectedHalaqahData={halaqahData}
        editingPrestasi={prestasi}
      />
    </Space>
  );
}
