"use client";

import React from "react";
import { Modal } from "antd";

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
}

export default function MobileBottomSheet({
  open,
  onClose,
  title,
  children,
  height = "max-h-[85vh]",
}: MobileBottomSheetProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      style={{ top: 'auto', bottom: 0, margin: 0, padding: 0 }}
      width="100%"
      className="pwa-bottom-sheet"
      modalRender={(node) => (
        <div className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto rounded-t-3xl bg-slate-900 border-t border-slate-800 shadow-2xl overflow-hidden pb-safe">
          {/* Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3" />
          {title && (
            <div className="px-5 pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800/80"
              >
                Tutup
              </button>
            </div>
          )}
          <div className={`p-5 overflow-y-auto ${height}`}>{children}</div>
        </div>
      )}
    >
      {null}
    </Modal>
  );
}
