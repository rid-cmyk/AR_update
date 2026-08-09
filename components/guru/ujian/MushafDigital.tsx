'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Spin, Select, Button, Modal } from 'antd'
import {
  BookOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SoundOutlined,
  ReadOutlined,
  CloseOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'

const { Option } = Select
import { toArabicDigits, JUZ_TO_PAGE_MAPPING, AyahItem } from './mushafConstants';
export interface MushafDigitalProps {
  juzMulai?: number;
  juzSampai?: number;
  tipeUjian?: 'per-juz' | 'per-halaman';
  onPageChange?: (pageNumber: number) => void;
  onJuzChange?: (juz: number) => void;
  currentPage?: number;
  currentJuz?: number;
  className?: string;
  showAcakHalaman?: boolean;
  kategoriUjian?: string;
}

export function MushafDigital({
  juzMulai = 1,
  juzSampai = 30,
  onPageChange,
  onJuzChange,
  currentPage: propPage = 1,
  currentJuz: propJuz,
  className = '',
}: MushafDigitalProps) {
  const [page, setPage] = useState<number>(propPage);
  const [activeJuz, setActiveJuz] = useState<number>(propJuz || juzMulai);
  const [loading, setLoading] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Ayah data for current page
  const [ayahList, setAyahList] = useState<AyahItem[]>([]);
  const [surahInfo, setSurahInfo] = useState<{ name: string; englishName: string; type: string }>({
    name: 'Al-Fatihah',
    englishName: 'Al-Fatihah',
    type: 'Makkiyah'
  });

  // Selected Ayah for Translation Bottom Sheet (Immersive View)
  const [selectedAyah, setSelectedAyah] = useState<AyahItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animation Page Flip direction state
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);

  // Touch Swipe Refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propPage && propPage !== page) {
      setPage(propPage);
    }
  }, [propPage]);

  useEffect(() => {
    if (propJuz && propJuz !== activeJuz) {
      setActiveJuz(propJuz);
    }
  }, [propJuz]);

  // Determine Juz from Page
  const calculateJuzFromPage = (pageNum: number) => {
    for (const [juzStr, mapping] of Object.entries(JUZ_TO_PAGE_MAPPING)) {
      if (pageNum >= mapping.start && pageNum <= mapping.end) {
        return Number(juzStr);
      }
    }
    return 1;
  };

  // Fetch Page Data (Rasm Utsmani 15 Baris & Terjemahan)
  const fetchPageContent = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      // 1. Fetch Utsmani text
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`);
      // 2. Fetch Indonesian translation in parallel
      const resTrans = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/id.indonesian`);

      if (res.ok) {
        const data = await res.json();
        let transData: any = null;
        if (resTrans.ok) {
          transData = await resTrans.json();
        }

        if (data.code === 200 && data.data?.ayahs?.length > 0) {
          const ayahs: AyahItem[] = data.data.ayahs.map((a: any, idx: number) => {
            const transObj = transData?.data?.ayahs?.[idx];
            return {
              numberInSurah: a.numberInSurah,
              text: a.text,
              translation: transObj ? transObj.text : 'Terjemahan tidak tersedia.',
              audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`,
              surahName: a.surah.name,
              surahNumber: a.surah.number
            };
          });

          const firstSurah = data.data.ayahs[0].surah;
          setSurahInfo({
            name: firstSurah.name,
            englishName: firstSurah.englishName,
            type: firstSurah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'
          });

          setAyahList(ayahs);
        }
      } else {
        // Fallback to local /api/mushaf
        const localRes = await fetch(`/api/mushaf?page=${pageNum}`);
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData.success && localData.data) {
            setAyahList([
              {
                numberInSurah: 1,
                text: localData.data.content || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                translation: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.'
              }
            ]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch mushaf page:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageContent(page);
    const newJuz = calculateJuzFromPage(page);
    if (newJuz !== activeJuz) {
      setActiveJuz(newJuz);
      onJuzChange?.(newJuz);
    }
  }, [page, fetchPageContent, onJuzChange]);

  // Page Turn Handlers with Flip Animation
  const changePage = (newPage: number, direction: 'left' | 'right') => {
    if (newPage < 1 || newPage > 604) return;
    setFlipDirection(direction);
    setTimeout(() => {
      setPage(newPage);
      onPageChange?.(newPage);
      setFlipDirection(null);
    }, 150);
  };

  const handleNext = () => changePage(page + 1, 'right');
  const handlePrev = () => changePage(page - 1, 'left');

  // Touch Swipe Handlers for Horizontal Swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum px swipe

    if (diff > threshold) {
      // Swiped Left -> Next page in RTL
      handleNext();
    } else if (diff < -threshold) {
      // Swiped Right -> Previous page in RTL
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Audio Handler
  const toggleAudio = (audioUrl?: string) => {
    if (!audioUrl) return;
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play();
      setIsPlayingAudio(true);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
  };

  // Check if initial pages (Surah Al-Fatihah page 1 or Al-Baqarah page 2) for ornate header
  const isSpecialPage = page === 1 || page === 2;

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-amber-100 select-none ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border-b border-amber-900/40 text-xs">
        <div className="flex items-center gap-2">
          <Select
            value={activeJuz}
            onChange={(juz) => {
              const startP = JUZ_TO_PAGE_MAPPING[juz]?.start || 1;
              changePage(startP, 'right');
            }}
            className="w-28 text-xs font-bold"
            options={Array.from({ length: 30 }, (_, i) => ({
              value: i + 1,
              label: `Juz ${i + 1}`,
            }))}
          />

          <Select
            value={page}
            onChange={(p) => changePage(p, p > page ? 'right' : 'left')}
            showSearch
            className="w-32 text-xs font-bold"
            options={Array.from({ length: 604 }, (_, i) => ({
              value: i + 1,
              label: `Hal. ${i + 1}`,
            }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
            className="bg-slate-800 text-amber-200 border-slate-700"
          />
          <span className="text-[11px] font-mono text-amber-400">{zoomLevel}%</span>
          <Button
            size="small"
            icon={<ZoomInOutlined />}
            onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
            className="bg-slate-800 text-amber-200 border-slate-700"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="small"
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={page <= 1}
            className="bg-amber-600/20 text-amber-300 border-amber-500/30 hover:bg-amber-600/40"
          >
            Sblm
          </Button>
          <span className="text-xs font-bold px-2 text-slate-300">
            {page} / 604
          </span>
          <Button
            size="small"
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={page >= 604}
            className="bg-amber-600/20 text-amber-300 border-amber-500/30 hover:bg-amber-600/40"
          >
            Lanjut
          </Button>
        </div>
      </div>

      {/* Main 15-Line Mushaf Container with Islamic Frame & Touch Swiping */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden bg-radial from-slate-900 via-slate-950 to-black"
      >
        {/* Illumination Frame Wrapper */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})` }}
          className={`w-full max-w-xl mx-auto rounded-3xl border-4 aspect-[0.67] flex flex-col ${
            isSpecialPage
              ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.25)] bg-slate-900/90'
              : 'border-amber-900/60 shadow-2xl bg-slate-950'
          } p-4 sm:p-6 relative transition-transform duration-200 min-h-[580px] ${
            flipDirection === 'right'
              ? 'animate-slide-right'
              : flipDirection === 'left'
              ? 'animate-slide-left'
              : ''
          }`}
        >
          {/* Ornate Islamic Border Pattern Decorator */}
          <div className="absolute inset-1 border border-dashed border-amber-600/30 rounded-2xl pointer-events-none" />
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br-sm pointer-events-none" />

          {/* Header Halaman (Surah, Juz, Makkiyah/Madaniyah) */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-900/50 text-xs text-amber-300/90 font-serif">
            <div className="flex items-center gap-1.5">
              <BookOutlined className="text-amber-500" />
              <span className="font-extrabold">{surahInfo.name}</span>
            </div>
            <div className="bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/40 text-[11px] font-sans font-bold text-amber-400">
              Juz {activeJuz} • {surahInfo.type}
            </div>
          </div>

          {/* 15-Line Content Standard (RTL Inline Flow) */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <Spin size="large" />
              <span className="text-xs text-amber-400 font-sans">Memuat Mushaf Utsmani 15 Baris...</span>
            </div>
          ) : (
            <div
              dir="rtl"
              className="flex-1 text-right text-amber-100 font-serif leading-loose text-xl sm:text-2xl tracking-wide select-none mushaf-layout"
              style={{ fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
            >
              {/* Surah Bismillah / Header Banner if ayah #1 */}
              {ayahList.length > 0 && ayahList[0].numberInSurah === 1 && (
                <div className="text-center my-3 py-2 bg-gradient-to-r from-amber-950/20 via-amber-900/40 to-amber-950/20 rounded-xl border border-amber-700/30">
                  <div className="text-sm font-bold text-amber-300 font-sans">
                    سُورَةُ {ayahList[0].surahName || surahInfo.name}
                  </div>
                  {ayahList[0].surahNumber !== 9 && ayahList[0].surahNumber !== 1 && (
                    <div className="text-base text-amber-200 mt-1">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                  )}
                </div>
              )}

              {/* RTL Inline Text & End-of-Ayah Sign */}
              {ayahList.map((ayah, idx) => (
                <span
                  key={idx}
                  onClick={() => setSelectedAyah(ayah)}
                  className="cursor-pointer hover:bg-amber-500/20 hover:text-amber-300 rounded px-1 transition-colors duration-150 inline"
                  title="Ketuk untuk melihat Terjemahan & Audio"
                >
                  <span>{ayah.text}</span>
                  <span className="inline-block mx-1.5 text-amber-400 font-sans text-base font-extrabold select-none">
                    ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Footer Halaman (Nomor Halaman Arab & Latin) */}
          <div className="pt-3 mt-4 border-t border-amber-900/50 flex items-center justify-between text-[11px] text-amber-400/80 font-sans">
            <span>Halaman {page}</span>
            <span className="text-xs font-mono font-bold">الصفحة {toArabicDigits(page)}</span>
          </div>
        </div>

        {/* Floating Swipe Helper Note for Mobile */}
        <div className="mt-3 text-[11px] text-slate-500 text-center flex items-center gap-2">
          <span>👈 Geser Layar Ke Kiri / Kanan Untuk Membalik Halaman</span>
        </div>
      </div>

      {/* Tap-to-Translate Persistent Bottom Sheet (Immersive View) */}
      {/* MushafAudioModal removed */}
    </div>
  );
}

export default MushafDigital;
