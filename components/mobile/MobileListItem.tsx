"use client";

import React from "react";
import { RightOutlined } from "@ant-design/icons";

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  rightContent?: React.ReactNode;
  showArrow?: boolean;
  onClick?: () => void;
  className?: string;
}

function MobileListItemComponent({
  title,
  subtitle,
  avatar,
  rightContent,
  showArrow = true,
  onClick,
  className = "",
}: MobileListItemProps) {
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
      aria-label={onClick ? `${title}${subtitle ? ` - ${subtitle}` : ""}` : undefined}
      className={`bg-navy-900/40 hover:bg-navy-900/70 border border-navy-800/50 rounded-xl p-4 flex items-center justify-between transition-all content-auto ${
        onClick
          ? "cursor-pointer tap-active tap-instant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
        {rightContent && <div>{rightContent}</div>}
        {showArrow && (
          <RightOutlined className="text-xs text-slate-500 font-bold" />
        )}
      </div>
    </div>
  );
}

export default React.memo(MobileListItemComponent);
