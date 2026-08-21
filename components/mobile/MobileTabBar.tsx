"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useMobileNavItems } from "@/hooks/useMobileNavItems";

function MobileTabBarComponent() {
  const pathname = usePathname() || "";
  const hidden = useHideOnScroll();
  const { items: currentNavItems, activeColor, dotColor } = useMobileNavItems();

  const isCurrentActive = (itemHref: string) => {
    if (pathname === itemHref) return true;
    // Cek apakah pathname dimulai dengan href (kecuali dashboard agar tidak me-match semua)
    if (!itemHref.endsWith("/dashboard") && pathname.startsWith(itemHref)) {
      return true;
    }
    return false;
  };

  return (
    <nav
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      className="fixed inset-x-0 z-40 pointer-events-none transition-transform duration-300 ease-out gpu-layer"
      data-hidden={hidden}
    >
      <div className="mx-auto w-[calc(100%-1.5rem)] max-w-md">
        <div
          className={`flex items-center justify-around h-14 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg shadow-slate-300/50 px-1 pointer-events-auto transition-transform duration-300 ease-out ${
            hidden ? "translate-y-[calc(100%+1rem)]" : "translate-y-0"
          }`}
        >
          {currentNavItems.map((item) => {
            const active = isCurrentActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center flex-1 rounded-full py-1 transition-all tap-active tap-instant ${
                  active ? activeColor : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className="relative mb-0.5">
                  {active ? item.activeIcon : item.icon}
                  {active && (
                    <span
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`}
                    />
                  )}
                </div>
                <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default React.memo(MobileTabBarComponent);
