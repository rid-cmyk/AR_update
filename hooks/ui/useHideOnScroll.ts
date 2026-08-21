import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface UseHideOnScrollOptions {
  /** Jarak scroll vertikal minimal (px) sebelum bar boleh bersembunyi. */
  triggerOffset?: number;
  /** Perubahan arah scroll minimal (px) untuk mengubah status. */
  scrollThreshold?: number;
}

export function useHideOnScroll(options: UseHideOnScrollOptions = {}) {
  const { triggerOffset = 60, scrollThreshold = 8 } = options;

  const [hidden, setHidden] = useState(false);
  const pathname = usePathname() || "";

  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;

        if (currentY <= triggerOffset) {
          setHidden(false);
        } else {
          const delta = currentY - lastYRef.current;
          if (Math.abs(delta) >= scrollThreshold) {
            setHidden(delta > 0);
          }
        }

        lastYRef.current = currentY;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [triggerOffset, scrollThreshold]);

  return hidden;
}
