"use client";

import React, { useState, useEffect, useCallback } from "react";

export type BottomSheetState = "collapsed" | "half" | "full";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  initialState?: BottomSheetState;
  onStateChange?: (state: BottomSheetState) => void;
  snapPoints?: [number, number, number];
  maxWidth?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  initialState = "collapsed",
  onStateChange,
  snapPoints = [76, 220, 500],
  maxWidth = "max-w-lg",
}: MobileBottomSheetProps) {
  const [sheetState, setSheetState] = useState<BottomSheetState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStateChange = useCallback(
    (newState: BottomSheetState) => {
      setSheetState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  const handleOverlayClick = useCallback(() => {
    if (sheetState !== "collapsed") {
      handleStateChange("collapsed");
    } else {
      onClose();
    }
  }, [sheetState, onClose, handleStateChange]);

  const handleDrag = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (isTransitioning) return;
    },
    [isTransitioning]
  );

  const getHeight = (state: BottomSheetState) => {
    const [collapsed, half, full] = snapPoints;
    switch (state) {
      case "collapsed":
        return `${collapsed}px`;
      case "half":
        return `${half}px`;
      case "full":
        return `${full}px`;
    }
  };

  const getOverlayOpacity = () => {
    switch (sheetState) {
      case "collapsed":
        return 0;
      case "half":
        return 0.3;
      case "full":
        return 0.6;
    }
  };

  if (!isOpen && sheetState === "collapsed") return null;

  return (
    <>
      <div
        onClick={handleOverlayClick}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sheetState === "collapsed"
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        }`}
        style={{ opacity: getOverlayOpacity() }}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 ${maxWidth} mx-auto transition-all duration-300 ease-out`}
        style={{ height: getHeight(sheetState) }}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Bottom Sheet"}
      >
        <div
          className="absolute inset-x-0 top-0 h-14 flex items-center justify-center"
          onClick={() =>
            handleStateChange(
              sheetState === "collapsed" ? "half" : sheetState === "half" ? "full" : "collapsed"
            )
          }
        >
          <div
            className="w-10 h-1.5 bg-slate-300 rounded-full transition-colors duration-200 hover:bg-slate-400 cursor-pointer"
            aria-label={
              sheetState === "collapsed"
                ? "Expand bottom sheet"
                : sheetState === "half"
                ? "Expand to full"
                : "Collapse bottom sheet"
            }
          />
        </div>

        <div className="absolute inset-x-0 top-14 bottom-0 bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl shadow-black/15 overflow-hidden flex flex-col">
          {title && (
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between sticky top-14 bg-white/95 backdrop-blur-md z-10">
              <h3 className="text-base font-bold text-deep-space">{title}</h3>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-deep-space px-3 py-1.5 rounded-lg bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close bottom sheet"
              >
                Tutup
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 pb-safe" style={{ WebkitOverflowScrolling: "touch" }}>
            {children}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-white/95 backdrop-blur-md sticky bottom-0 flex items-center justify-center gap-2">
            <button
              onClick={() => handleStateChange("collapsed")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                sheetState === "collapsed"
                  ? "bg-blue-green text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              aria-pressed={sheetState === "collapsed"}
            >
              ▼ Tutup
            </button>
            <button
              onClick={() => handleStateChange("half")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                sheetState === "half"
                  ? "bg-blue-green text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              aria-pressed={sheetState === "half"}
            >
              ■ 50%
            </button>
            <button
              onClick={() => handleStateChange("full")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                sheetState === "full"
                  ? "bg-blue-green text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              aria-pressed={sheetState === "full"}
            >
              ▲ 100%
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileBottomSheet;
