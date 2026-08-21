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
  hafalan: "/guru/hafalan",
  target: "/guru/target",
  absensi: "/guru/absensi",
};

const THEME: NotifikasiTheme = {
  accent: "#219ebc",
  accent2: "#023047",
  dotShadow: "rgba(82, 196, 26, 0.4)",
  filterBg: "#f6ffed",
  filterBorder: "#b7eb8f",
  unreadBgFrom: "#f6ffed",
  unreadBgTo: "#eaf6fb",
  unreadBorder: "#b7eb8f",
  listTitleFrom: "#219ebc",
  listTitleTo: "#023047",
  listCardBg: "#ffffff",
  listCardBorder: "rgba(82, 196, 26, 0.1)",
  statCards: {
    unread: { from: "#219ebc", to: "#023047", shadow: "rgba(82, 196, 26, 0.2)" },
    today: { from: "#00B894", to: "#00CEC9", shadow: "rgba(0, 184, 148, 0.2)" },
    week: { from: "#8ecae6", to: "#531DAB", shadow: "rgba(114, 46, 209, 0.2)" },
  },
};

export default function NotifikasiPage() {
  const {
    notifikasiList,
    loading,
    filterStatus,
    setFilterStatus,
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
        subtitle="Update hafalan, target, pengumuman, dan informasi terbaru dari sekolah"
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

      {/* Simple Filter */}
      <NotifikasiFilter
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        total={notifikasiList.length}
        unreadCount={unreadCount}
        readCount={notifikasiList.length - unreadCount}
        theme={THEME}
        size="middle"
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
        drawerTitle="Detail Pengumuman & Notifikasi"
        drawerSubtitle="Informasi lengkap pengumuman resmi dan aktivitas halaqah Guru"
      />
    </div>
  );
}