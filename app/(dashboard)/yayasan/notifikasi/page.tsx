"use client";

import { Button, Modal, Space } from "antd";
import { BellOutlined, CheckOutlined, ClearOutlined, ClockCircleOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import { useNotifikasi } from "@/hooks/useNotifikasi";
import { NotifikasiStats } from "@/components/notifikasi/NotifikasiStats";
import { NotifikasiFilter } from "@/components/notifikasi/NotifikasiFilter";
import { NotifikasiList } from "@/components/notifikasi/NotifikasiList";
import { NotifikasiDetailDrawer } from "@/components/notifikasi/NotifikasiDetailDrawer";
import type { NotifikasiTheme } from "@/components/notifikasi/notifikasiUi";

const ACTION_URL_MAP = {
  hafalan: "/yayasan/laporan",
  target: "/yayasan/laporan",
  absensi: "/yayasan/laporan",
};

const THEME: NotifikasiTheme = {
  accent: "#ffb703",
  accent2: "#D46B08",
  dotShadow: "rgba(250, 140, 22, 0.4)",
  filterBg: "#fff7e6",
  filterBorder: "#ffd591",
  unreadBgFrom: "#fff7e6",
  unreadBgTo: "#ffecc7",
  unreadBorder: "#ffd591",
  listTitleFrom: "#ffb703",
  listTitleTo: "#D46B08",
  listCardBg: "#ffffff",
  listCardBorder: "rgba(250, 140, 22, 0.1)",
  statCards: {
    unread: { from: "#ffb703", to: "#D46B08", shadow: "rgba(250, 140, 22, 0.2)" },
    today: { from: "#00B894", to: "#00CEC9", shadow: "rgba(0, 184, 148, 0.2)" },
    week: { from: "#13C2C2", to: "#08979C", shadow: "rgba(19, 194, 194, 0.2)" },
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
        subtitle="Update laporan, pengumuman, dan informasi terbaru dari sekolah"
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
        total={notifikasiList.length}
        unreadCount={unreadCount}
        readCount={notifikasiList.length - unreadCount}
        theme={THEME}
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
        drawerSubtitle="Informasi lengkap pengumuman resmi dan aktivitas sistem Yayasan"
      />
    </div>
  );
}