"use client";

import React from "react";
import { Skeleton } from "antd";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "#219ebc",
  loading = false,
  onClick,
  className = "",
}) => {
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
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          : ""
      } ${className}`}
    >
      {/* Subtle decorative background circle */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <div className="relative z-10 flex flex-col justify-between">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>

            {icon && (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `${color}`,
                  boxShadow: `0 4px 12px ${color}33`,
                }}
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>

            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%{trend.label ? ` ${trend.label}` : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;