"use client";

import React from "react";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import type { Notifikasi } from "@/hooks/useNotifikasi";

export interface NotifikasiDetailDrawerProps {
  selected: Notifikasi | null;
  open: boolean;
  onClose: () => void;
  drawerTitle: string;
  drawerSubtitle: string;
}

/** Detail pengumuman: Modal untuk mobile (<1024px) + WebSideDrawer untuk desktop (>=1024px) */
export function NotifikasiDetailDrawer({
  selected,
  open,
  onClose,
  drawerTitle,
  drawerSubtitle,
}: NotifikasiDetailDrawerProps) {
  const renderContent = () =>
    selected ? (
      <div>
        <h3>{selected.judul}</h3>
        <p>{selected.fullContent || selected.pesan}</p>
        <div style={{ marginTop: 16, fontSize: "12px", color: "#666" }}>
          Dari: {selected.pengirim} •{" "}
          {dayjs(selected.tanggal).format("DD MMMM YYYY, HH:mm")}
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* Mobile Modal (< 1024px) */}
      <Modal
        title="Detail Pengumuman"
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
        className="lg:hidden"
      >
        {renderContent()}
      </Modal>

      {/* Desktop WebSideDrawer (>= 1024px) */}
      <WebSideDrawer
        isOpen={open}
        onClose={onClose}
        title={drawerTitle}
        subtitle={drawerSubtitle}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button type="primary" onClick={onClose}>
              Tutup
            </Button>
          </div>
        }
      >
        {renderContent()}
      </WebSideDrawer>
    </>
  );
}

export default NotifikasiDetailDrawer;