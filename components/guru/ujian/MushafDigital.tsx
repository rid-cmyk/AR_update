'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Spin, Select, Button } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'

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
    setPage((prev) => (prev === propPage ? prev : propPage));
  }, [propPage]);

  useEffect(() => {
    if (propJuz) {
      setActiveJuz((prev) => (prev === propJuz ? prev : propJuz));
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

  // Surah set present on the current page (preserving order)
  const surahSet = useMemo(() => {
    const seen: { number: number; arabic: string; latin: string }[] = [];
    for (const a of ayahList) {
      if (!a.surahNumber) continue;
      if (!seen.some((s) => s.number === a.surahNumber)) {
        seen.push({
          number: a.surahNumber,
          arabic: a.surahName || surahInfo.name,
          latin: a.surahLatinName || surahInfo.englishName,
        });
      }
    }
    return seen;
  }, [ayahList, surahInfo]);

  const lastSurah = surahSet[surahSet.length - 1];
  const surahArabic = lastSurah?.arabic || surahInfo.name;
  const surahLatin = surahSet.length > 1
    ? `${surahSet[0].latin} → ${surahSet[surahSet.length - 1].latin}`
    : lastSurah?.latin || surahInfo.englishName;

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
              surahLatinName: a.surah.englishName,
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
    setActiveJuz((prev) => (prev === newJuz ? prev : newJuz));
  }, [page, fetchPageContent]);

  const prevJuzRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevJuzRef.current !== null && prevJuzRef.current !== activeJuz) {
      onJuzChange?.(activeJuz);
    }
    prevJuzRef.current = activeJuz;
  }, [activeJuz, onJuzChange]);

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

  return (
    <div className={`flex flex-col h-full bg-[#fbf8f2] text-slate-900 select-none ${className}`}>
      {/* Top Controls Toolbar — minimal ala NU Online */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Select
            value={activeJuz}
            onChange={(juz) => {
              const startP = JUZ_TO_PAGE_MAPPING[juz]?.start || 1;
              changePage(startP, 'right');
            }}
            className="w-24 text-xs font-semibold"
            options={Array.from({ length: 30 }, (_, i) => ({
              value: i + 1,
              label: `Juz ${i + 1}`,
            }))}
          />

          <Select
            value={page}
            onChange={(p) => changePage(p, p > page ? 'right' : 'left')}
            showSearch
            className="w-28 text-xs font-semibold"
            options={Array.from({ length: 604 }, (_, i) => ({
              value: i + 1,
              label: `Hal. ${i + 1}`,
            }))}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="small"
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={page <= 1}
            className="!border-slate-200 !text-slate-600"
          />
          <span className="text-xs font-semibold text-slate-500 px-1">
            {page} / 604
          </span>
          <Button
            size="small"
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={page >= 604}
            className="!border-slate-200 !text-slate-600"
          />
        </div>
      </div>

      {/* Main Mushaf Content — clean & simple */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto p-4 sm:p-6"
      >
        <div
          className={`max-w-2xl mx-auto w-full ${
            flipDirection === 'right'
              ? 'animate-slide-right'
              : flipDirection === 'left'
              ? 'animate-slide-left'
              : ''
          }`}
        >
          {/* Header Surah */}
          <div className="text-center pb-3 mb-4 border-b border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Halaman {page} • Juz {activeJuz}
            </div>
            <div className="text-base font-bold text-slate-700 mt-0.5" dir="rtl">
              سُورَةُ {surahArabic}
            </div>
            <div className="text-[11px] font-semibold text-blue-green mt-0.5">
              {surahLatin}
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Spin size="small" />
              <span className="text-xs text-slate-400">
                Memuat Mushaf Utsmani...
              </span>
            </div>
          ) : (
            <div
              dir="rtl"
              className="text-right text-slate-900 font-serif leading-loose text-[22px] sm:text-[26px] tracking-wide select-none mushaf-layout"
              style={{ fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
            >
              {(() => {
                const firstAyah = ayahList[0];
                if (!firstAyah || firstAyah.numberInSurah !== 1) return null;
                if (firstAyah.surahNumber === 1 || firstAyah.surahNumber === 9) return null;
                return (
                  <div className="text-center my-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <div className="text-base text-slate-700">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                  </div>
                );
              })()}

              {ayahList.map((ayah, idx) => (
                <span
                  key={idx}
                  onClick={() => setSelectedAyah(ayah)}
                  className="cursor-pointer hover:bg-amber-100 hover:text-slate-800 rounded px-1 transition-colors duration-150 inline"
                  title="Ketuk untuk melihat Terjemahan & Audio"
                >
                  <span>{ayah.text}</span>
                  <span className="inline-block mx-1.5 text-emerald-700 font-sans text-base font-extrabold select-none">
                    ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Footer Halaman */}
          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>Halaman {page}</span>
            <span className="font-mono">الصفحة {toArabicDigits(page)}</span>
          </div>
        </div>
      </div>

      {/* Tap-to-Translate Panel (minimal, inline) */}
      {selectedAyah && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-emerald-700">
                {selectedAyah.surahName || surahInfo.name} :{' '}
                {selectedAyah.numberInSurah}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                {selectedAyah.translation}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="small"
                icon={isPlayingAudio ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => toggleAudio(selectedAyah.audioUrl)}
                className="!border-emerald-600 !text-emerald-600"
              />
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setSelectedAyah(null)}
                className="!border-slate-200 !text-slate-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MushafDigital;
