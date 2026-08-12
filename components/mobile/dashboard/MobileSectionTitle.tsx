"use client";

import React from "react";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";

interface MobileSectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  link?: string;
  linkLabel?: string;
}

export function MobileSectionTitle({ title, icon, link, linkLabel = "Lihat Semua" }: MobileSectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-bold leading-snug text-deep-space">
        {icon && <span className="text-blue-green">{icon}</span>}
        {title}
      </h3>
      {link && (
        <Link
          href={link}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-green"
        >
          {linkLabel}
          <RightOutlined className="text-[9px]" />
        </Link>
      )}
    </div>
  );
}
