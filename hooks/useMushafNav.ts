import { useState, useEffect, useCallback } from 'react';

export const JUZ_START_PAGE: Record<number, number> = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
  11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
  21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582,
};

export function useMushafNav(juzMulai: number = 1, currentJuz?: number) {
  const [activeJuz, setActiveJuz] = useState<number>(currentJuz || juzMulai);
  const [currentPage, setCurrentPage] = useState<number>(JUZ_START_PAGE[activeJuz] || 1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  useEffect(() => {
    if (currentJuz && currentJuz !== activeJuz) {
      setActiveJuz(currentJuz);
    }
  }, [currentJuz, activeJuz]);

  useEffect(() => {
    const startPage = JUZ_START_PAGE[activeJuz] || 1;
    setCurrentPage(startPage);
  }, [activeJuz]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(604, prev + 1));
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const zoomIn = useCallback(() => setZoomLevel((z) => Math.min(150, z + 10)), []);
  const zoomOut = useCallback(() => setZoomLevel((z) => Math.max(80, z - 10)), []);

  const goToJuz = useCallback((juz: number) => {
    const validJuz = Math.max(1, Math.min(30, juz));
    setActiveJuz(validJuz);
  }, []);

  return {
    activeJuz,
    setActiveJuz,
    currentPage,
    setCurrentPage,
    zoomLevel,
    setZoomLevel,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    goToJuz,
  };
}
