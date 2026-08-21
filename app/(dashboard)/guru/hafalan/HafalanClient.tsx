"use client";

import { useEffect, useState } from "react";
import { useHafalanGuru } from "@/hooks";
import {
  Table,
  Button,
  Modal,
  Form,
  message,
  Card,
} from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import HafalanSummaryCards from "@/components/guru/hafalan/HafalanSummaryCards";
import HafalanStatisticsCards from "@/components/guru/hafalan/HafalanStatisticsCards";
import HafalanFiltersCard from "@/components/guru/hafalan/HafalanFiltersCard";
import HafalanForm from "@/components/guru/hafalan/HafalanForm";
import { getHafalanColumns } from "@/components/guru/hafalan/hafalanColumns";
import { buildHafalanSummaryBySantri, buildHafalanPayload, type Hafalan } from "@/lib/utils/hafalanUtils";
import dayjs from "dayjs";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { useTablePagination } from "@/hooks/useTablePagination";

interface HafalanClientProps {
  initialHafalanList: Hafalan[];
  initialSantriList: {
    id: number;
    namaLengkap: string;
    username: string;
  }[];
}

export default function HafalanClient({
  initialHafalanList,
  initialSantriList,
}: HafalanClientProps) {
  const {
    hafalanList, santriList, loading,
    isModalOpen, editingHafalan, filters, setFilters,
    fetchHafalan, saveHafalan, deleteHafalan,
    openModal, closeModal,
  } = useHafalanGuru({ initialHafalanList, initialSantriList });

  const [hasMounted, setHasMounted] = useState(false);
  const selectedDate = dayjs();
  const [form] = Form.useForm();
  const pagination = useTablePagination({ totalLabel: "hafalan" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-fetch on filter change with debounce
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetchHafalan();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, isInitialLoad, fetchHafalan]);

  const handleSaveHafalan = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildHafalanPayload(values, selectedDate.format('YYYY-MM-DD'));
      await saveHafalan(payload);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleOpenModal = (hafalan?: Hafalan) => {
    setHasMounted(true);
    if (hafalan) {
      form.setFieldsValue(hafalan);
    } else {
      form.resetFields();
    }
    openModal(hafalan);
  };

  const handleCloseModal = () => {
    closeModal();
    form.resetFields();
  };

  const columns = getHafalanColumns({
    onEdit: handleOpenModal,
    onDelete: deleteHafalan,
  });

  return (
    <>
      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: #023047;
          color: white;
          font-weight: 600;
          border: none;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f0f9ff !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
          padding: 16px;
        }
      `}</style>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <AdminHeaderCard
          title="Data Hafalan Santri"
          subtitle="Kelola dan pantau progress hafalan santri di halaqah Anda"
          actions={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
            >
              Setoran Baru
            </Button>
          }
        />

        {/* Statistics Cards */}
        <HafalanStatisticsCards hafalanList={hafalanList as any} />

        {/* Enhanced Filters */}
        <HafalanFiltersCard filters={filters} setFilters={setFilters} />

        {/* Summary Cards per Santri */}
        <HafalanSummaryCards
          summaries={buildHafalanSummaryBySantri(hafalanList)}
        />
        {/* Table */}
        <Card title="📋 Detail Hafalan" className="shadow-md">
          <Table
            columns={columns}
            dataSource={hafalanList}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            className="custom-table"
          />
        </Card>

        {/* Mobile Modal (< 1024px) */}
        <Modal
          title={editingHafalan ? "Edit Hafalan" : "Tambah Hafalan"}
          open={isModalOpen}
          onCancel={handleCloseModal}
          onOk={handleSaveHafalan}
          okText="Simpan"
          className="lg:hidden"
        >
          <HafalanForm form={form} santriList={santriList} />
        </Modal>

        {/* Desktop WebSideDrawer (>= 1024px) */}
        <WebSideDrawer
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingHafalan ? "Edit Penilaian Hafalan" : "Catat Setoran Hafalan Baru"}
          subtitle="Catat surat, rentang ayat, kualitas hafalan (Mumtaz/Jayyid/dll), dan catatan perbaikan"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseModal}>Batal</Button>
              <Button type="primary" onClick={handleSaveHafalan}>Simpan</Button>
            </div>
          }
        >
          <HafalanForm form={form} santriList={santriList} />
        </WebSideDrawer>
      </div>
    </>
  );
}
