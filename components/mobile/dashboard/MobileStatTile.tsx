"use client";

import React from "react";

export type MobileStatColor = "blue" | "teal" | "amber" | "orange" | "violet" | "sky";

const STAT_STYLES: Record<MobileStatColor, string> = {
  blue: "bg-[#e3f1f8] text-[#219ebc]",
  sky: "bg-sky-blue/30 text-[#0a6d8a]",
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-flame",
  orange: "bg-orange-50 text-princeton",
  violet: "bg-violet-50 text-violet-600",
};

interface MobileStatTileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  suffix?: string;
  color?: MobileStatColor;
}

export function MobileStatTile({ icon, label, value, suffix, color = "blue" }: MobileStatTileProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg ${STAT_STYLES[color]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase leading-snug tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-lg font-extrabold leading-snug text-deep-space">
          {value}
          {suffix && <span className="ml-1 text-xs font-semibold text-slate-400">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
