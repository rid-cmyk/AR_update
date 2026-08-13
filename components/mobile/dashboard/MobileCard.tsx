"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className = "", onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn("rounded-2xl bg-white p-4 ring-1 ring-slate-200/80", className)}
    >
      {children}
    </div>
  );
}
