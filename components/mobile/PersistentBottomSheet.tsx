"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal } from "antd";
import { CloseOutlined, UpOutlined, DownOutlined, MinusOutlined } from "@ant-design/icons";

export type BottomSheetState = "collapsed" | "half" | "full";

interface PersistentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  initialState?: BottomSheetState;
  onStateChange?: (state: BottomSheetState) => void;
  minHeight?: number;
  maxHeight?: number;
  halfHeightRatio?: number;
  showGrabber?: boolean;
  persistent?: boolean;
}

const STATE_HEIGHTS = {
  collapsed: 80,
  half: 0.5,
  full: 0.9,
} as const;

export default function PersistentBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  initialState = "half",
  onStateChange,
  minHeight = 80,
  maxHeight,
  halfHeightRatio = 0.5,
  showGrabber = true,
  persistent = true,
}: PersistentBottomSheetProps) {
  const [sheetState, setSheetState] = useState<BottomSheetState>(initialState);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 667;
  const safeAreaInset = typeof window !== "undefined" ? 
    parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-inset-bottom") || "0", 10) : 0;

  const getStateHeight = useCallback((state: BottomSheetState): number => {
    if (state === "collapsed") return minHeight + safeAreaInset;
    const ratio = state === "half" ? halfHeightRatio : STATE_HEIGHTS.full;
    return Math.min(viewportHeight * ratio, maxHeight || viewportHeight) + safeAreaInset;
  }, [minHeight, maxHeight, halfHeightRatio, viewportHeight, safeAreaInset]);

  const currentHeight = getStateHeight(sheetState) + dragOffset;

  useEffect(() => {
    if (isOpen) {
      onStateChange?.(sheetState);
    }
  }, [sheetState, isOpen, onStateChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!persistent) return;
    startY.current = e.touches[0].clientY;
    startHeight.current = getStateHeight(sheetState);
    setIsDragging(true);
  }, [persistent, sheetState, getStateHeight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !persistent) return;
    const deltaY = startY.current - e.touches[0].clientY;
    const newHeight = Math.max(minHeight + safeAreaInset, Math.min(startHeight.current - deltaY, viewportHeight));
    setDragOffset(newHeight - getStateHeight(sheetState));
  }, [isDragging, persistent, minHeight, safeAreaInset, viewportHeight, sheetState, getStateHeight]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !persistent) return;
    setIsDragging(false);
    
    const finalHeight = getStateHeight(sheetState) + dragOffset;
    const collapsedThreshold = getStateHeight("collapsed") + (getStateHeight("half") - getStateHeight("collapsed")) * 0.3;
    const halfThreshold = getStateHeight("half") + (getStateHeight("full") - getStateHeight("half")) * 0.5;

    let newState: BottomSheetState;
    if (finalHeight <= collapsedThreshold) {
      newState = "collapsed";
    } else if (finalHeight >= halfThreshold) {
      newState = "full";
    } else {
      newState = "half";
    }

    setSheetState(newState);
    setDragOffset(0);
  }, [isDragging, persistent, dragOffset, sheetState, getStateHeight]);

  const handleGrabberClick = useCallback(() => {
    if (!persistent) return;
    const states: BottomSheetState[] = ["collapsed", "half", "full"];
    const currentIndex = states.indexOf(sheetState);
    const nextIndex = (currentIndex + 1) % states.length;
    setSheetState(states[nextIndex]);
  }, [persistent, sheetState]);

  const getGrabberIcon = () => {
    switch (sheetState) {
      case "collapsed":
        return <UpOutlined className="text-slate-400" />;
      case "half":
        return <MinusOutlined className="text-slate-400" />;
      case "full":
        return <DownOutlined className="text-slate-400" />;
    }
  };

  if (!isOpen && !persistent) return null;

  const sheetContent = (
    <div
      ref={sheetRef}
      className={`fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto rounded-t-3xl bg-white border-t border-slate-200 shadow-2xl shadow-black/15 overflow-hidden transition-all duration-300 ease-out ${
        isDragging ? "transition-none" : ""
      }`}
      style={{
        height: `${currentHeight}px`,
        transform: `translateY(${isOpen ? 0 : getStateHeight(sheetState)}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grabber Handle */}
      {showGrabber && (
        <div
          onClick={handleGrabberClick}
          className="flex flex-col items-center px-4 py-2.5 cursor-pointer select-none -mt-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleGrabberClick(); }}
          aria-label={`Bottom sheet state: ${sheetState}. Click to expand.`}
        >
          <div className="w-10 h-1.5 bg-slate-300 rounded-full mb-1.5 transition-colors duration-200 hover:bg-slate-400" />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {getGrabberIcon()}
            <span className="font-medium capitalize">{sheetState}</span>
          </div>
        </div>
      )}

      {/* Header */}
      {(title || !persistent) && (
        <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-deep-space">{title || "Formulir"}</h3>
          {!persistent && (
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-deep-space px-2 py-1 rounded-md bg-slate-100 active:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`p-5 overflow-y-auto ${persistent ? "pb-20" : "pb-8"}`}>
        {children}
      </div>
    </div>
  );

  if (!persistent) {
    return (
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        closable={false}
        style={{ top: 'auto', bottom: 0, margin: 0, padding: 0 }}
        width="100%"
        className="pwa-bottom-sheet"
        modalRender={(node) => (
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto">
            {sheetContent}
          </div>
        )}
      >
        {null}
      </Modal>
    );
  }

  return (
    <>
      {/* Backdrop - only show when not collapsed */}
      {sheetState !== "collapsed" && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: sheetState === "full" ? 1 : 0.5 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Sheet */}
      {sheetContent}
    </>
  );
}