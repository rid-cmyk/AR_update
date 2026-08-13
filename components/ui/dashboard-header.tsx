import React from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  badge?: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  badge,
  title,
  subtitle,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-blue via-blue-green to-deep-space p-6 sm:p-7 text-white shadow-lg shadow-blue-green/20",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-4 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -top-10 -left-8 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0">
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              {badge}
            </span>
          )}
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-white/85 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}

export default DashboardHeader;
