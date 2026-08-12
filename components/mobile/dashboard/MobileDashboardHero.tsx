"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { getTodayLabels } from "@/lib/utils/dateLocale";

export interface MobileHeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "ghost";
}

interface MobileDashboardHeroProps {
  avatarLabel: string;
  greeting: string;
  badge?: string;
  subtitle?: string;
  actions?: MobileHeroAction[];
  children?: React.ReactNode;
}

export function MobileDashboardHero({
  avatarLabel,
  greeting,
  badge,
  subtitle,
  actions,
  children,
}: MobileDashboardHeroProps) {
  const today = getTodayLabels();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-sky-blue/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-green/10 blur-2xl" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            size={52}
            className="shrink-0 bg-blue-green text-lg font-bold text-white shadow-md"
          >
            {avatarLabel}
          </Avatar>
          <div className="min-w-0 flex-1">
            {badge && (
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-blue-green">
                {badge}
              </span>
            )}
            <h1 className="truncate text-lg font-extrabold leading-snug text-deep-space">
              {greeting}
            </h1>
          </div>
        </div>

        {subtitle && (
          <p className="text-xs leading-relaxed text-slate-500">{subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-blue/25 px-2.5 py-1 text-[11px] font-semibold text-deep-space">
            <CalendarOutlined className="text-[10px] text-blue-green" />
            {today.masehi}
          </span>
          <span className="rounded-full bg-[#f4f9fb] px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/80">
            {today.hijri}
          </span>
        </div>

        {children && <div className="space-y-3">{children}</div>}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((action) => {
              const variant =
                action.variant === "ghost"
                  ? "bg-sky-blue/20 text-deep-space ring-1 ring-sky-blue/40 hover:bg-sky-blue/30"
                  : "bg-blue-green text-white hover:bg-[#1a87a2]";
              const cls = `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${variant}`;
              const inner = (
                <>
                  {action.icon}
                  {action.label}
                </>
              );
              return action.href ? (
                <Link key={action.label} href={action.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button key={action.label} type="button" onClick={action.onClick} className={cls}>
                  {inner}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
