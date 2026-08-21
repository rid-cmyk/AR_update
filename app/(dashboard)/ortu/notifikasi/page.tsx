"use client";

import { Button, Modal, Space } from "antd";
import { BellOutlined, CheckOutlined, ClearOutlined, ClockCircleOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import { useNotifikasi } from "@/hooks/useNotifikasi";
import { NotifikasiStats } from "@/components/notifikasi/NotifikasiStats";
import { NotifikasiFilter } from "@/components/notifikasi/NotifikasiFilter";
import { NotifikasiList } from "@/components/notifikasi/NotifikasiList";
import { NotifikasiDetailDrawer } from "@/components/notifikasi/NotifikasiDetailDrawer";
import type { NotifikasiTheme } from "@/components/notifikasi/notifikasiUi";

const ACTION_URL_MAP = {
  hafalan: "/ortu/hafalan",
  target: "/ortu/target",
  absensi: "/ortu/absensi",
};

const THEME: NotifikasiTheme = {
  accent: "#8ecae6",
  accent2: "#531DAB",
  dotShadow: "rgba(114, 46, 209, 0.4)",
  filterBg: "#f9f0ff",
  filterBorder: "#d3adf7",
  unreadBgFrom: "#f9f0ff",
  unreadBgTo: "#efdbff",
  unreadBorder: "#d3adf7",
  listTitleFrom: "#8ecae6",
  listTitleTo: "#531DAB",
  listCardBg: "#ffffff",
  listCardBorder: "rgba(114, 46, 209, 0.1)",
  statCards: {
    unread: { from: "#8ecae6", to: "#531DAB", shadow: "rgba(114, 46, 209, 0.2)" },
    today: { from: "#00B894", to: "#00CEC9", shadow: "rgba(0, 184, 148, 0.2)" },
    week: { from: "#ffb703", to: "#D46B08", shadow: "rgba(250, 140, 22, 0.2)" },
  },
};

export default function NotifikasiPage() {
  const {
    notifikasiList,
    loading,
    filterStatus,
    setFilterStatus,
    filterTipe,
    setFilterTipe,
    selectedNotifikasi,
    isDetailModalOpen,
    handleNotificationClick,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleClearAll,
    closeDetail,
    filteredData,
    unreadCount,
    todayCount,
    thisWeekCount,
  } = useNotifikasi({ actionUrlMap: ACTION_URL_MAP });

  const confirmClearAll = () => {
    Modal.confirm({
      title: "Hapus Semua Notifikasi",
      content: "Apakah Anda yakin ingin menghapus semua notifikasi?",
      okText: "Ya, Hapus Semua",
      cancelText: "Batal",
      okType: "danger",
      onOk: handleClearAll,
    });
  };

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <AdminHeaderCard
        title="Notifikasi & Pengumuman"
        subtitle="Update hafalan, target, pengumuman, dan informasi terbaru tentang anak"
        tags={[
          { label: "Notifikasi", icon: <BellOutlined /> },
          { label: "Online", icon: <ClockCircleOutlined /> }
        ]}
        actions={
          <Space>
            <Button
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Tandai Semua Dibaca
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={confirmClearAll}
              disabled={notifikasiList.length === 0}
              danger
            >
              Hapus Semua
            </Button>
          </Space>
        }
      />

      {/* Statistics Cards */}
      <NotifikasiStats
        unreadCount={unreadCount}
        todayCount={todayCount}
        thisWeekCount={thisWeekCount}
        statCards={THEME.statCards}
      />

      {/* Filter Section */}
      <NotifikasiFilter
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterTipe={filterTipe}
        onTipeChange={setFilterTipe}
        total={notifikasiList.length}
        unreadCount={unreadCount}
        readCount={notifikasiList.length - unreadCount}
        theme={THEME}
        columns="double"
      />

      {/* Notifications List */}
      <NotifikasiList
        items={filteredData}
        loading={loading}
        theme={THEME}
        onClick={handleNotificationClick}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {/* Detail Pengumuman (Modal mobile + WebSideDrawer desktop) */}
      <NotifikasiDetailDrawer
        selected={selectedNotifikasi}
        open={isDetailModalOpen}
        onClose={closeDetail}
        drawerTitle="Detail Pengumuman"
        drawerSubtitle="Informasi pengumuman dari pesantren dan laporan aktivitas santri"
      />
    </div>
  );
}