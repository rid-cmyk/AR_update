"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type MobileTileColor = "blue" | "teal" | "amber" | "orange" | "violet" | "sky";

const TILE_STYLES: Record<MobileTileColor, string> = {
  blue: "bg-[#219ebc]",
  sky: "bg-[#023047]",
  teal: "bg-[#0f766e]",
  amber: "bg-[#ffb703]",
  orange: "bg-[#fb8500]",
  violet: "bg-[#7c3aed]",
};

interface MobileQuickTileProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  color?: MobileTileColor;
}

export function MobileQuickTile({
  icon,
  label,
  href,
  onClick,
  color = "blue",
}: MobileQuickTileProps) {
  const inner = (
    <div className="flex w-full flex-col items-center gap-2 transition-transform active:scale-95">
      <span
        className={cn(
          "grid h-14 w-14 place-items-center rounded-2xl text-xl text-white shadow-md shadow-black/10",
          TILE_STYLES[color]
        )}
      >
        {icon}
      </span>
      <span className="flex w-full flex-col items-center">
        {label.split(" ").map((word, i) => (
          <span
            key={i}
            className="block text-center text-[11px] font-semibold leading-snug text-deep-space"
          >
            {word}
          </span>
        ))}
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="flex w-full flex-col items-center">
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className="flex w-full flex-col items-center text-center">
      {inner}
    </button>
  );
}
