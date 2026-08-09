"use client";

import React from "react";

interface MobileStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  colorScheme?: "blue" | "emerald" | "amber" | "purple";
  onClick?: () => void;
}

function MobileStatCardComponent({
  title,
  value,
  icon,
  subtitle,
  colorScheme = "blue",
  onClick,
}: MobileStatCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-navy-900/50 hover:bg-navy-900/80",
      border: "border-navy-800/60 hover:border-brand-teal/40",
      iconBg: "bg-brand-teal/15 text-brand-teal border border-brand-teal/20",
      text: "text-brand-teal",
    },
    emerald: {
      bg: "bg-navy-900/50 hover:bg-navy-900/80",
      border: "border-navy-800/60 hover:border-emerald-500/30",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      text: "text-emerald-400",
    },
    amber: {
      bg: "bg-navy-900/50 hover:bg-navy-900/80",
      border: "border-navy-800/60 hover:border-princeton/40",
      iconBg: "bg-princeton/15 text-princeton border border-princeton/20",
      text: "text-princeton",
    },
    purple: {
      bg: "bg-navy-900/50 hover:bg-navy-900/80",
      border: "border-navy-800/60 hover:border-brand-teal/40",
      iconBg: "bg-brand-teal/15 text-brand-teal border border-brand-teal/20",
      text: "text-brand-teal",
    },
  };

  const scheme = colorMap[colorScheme];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={onClick ? `${title}: ${value}` : undefined}
      className={`${scheme.bg} border ${scheme.border} rounded-xl p-4 flex flex-col justify-between shadow-sm transition-all ${
        onClick
          ? "cursor-pointer tap-active tap-instant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl ${scheme.iconBg} flex items-center justify-center text-base shadow-sm`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight leading-none mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(MobileStatCardComponent);
