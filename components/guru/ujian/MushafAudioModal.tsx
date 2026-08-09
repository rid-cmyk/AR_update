import React from "react";
import { Modal, Button } from "antd";
import { ReadOutlined, CloseOutlined, PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { toArabicDigits } from "./mushafConstants";

interface MushafAudioModalProps {
  selectedAyah: any;
  setSelectedAyah: (ayah: any) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (isPlaying: boolean) => void;
  toggleAudio: (url: string) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export default function MushafAudioModal({
  selectedAyah,
  setSelectedAyah,
  isPlayingAudio,
  setIsPlayingAudio,
  toggleAudio,
  audioRef
}: MushafAudioModalProps) {
  return (
    <Modal
      open={!!selectedAyah}
      onCancel={() => {
        setSelectedAyah(null);
        if (isPlayingAudio) {
          audioRef.current?.pause();
          setIsPlayingAudio(false);
        }
      }}
      footer={null}
      closable={false}
      style={{ top: 'auto', bottom: 0, margin: 0 }}
      width="100%"
      modalRender={() => (
        <div className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto rounded-t-3xl bg-slate-900 border-t border-amber-500/30 shadow-2xl p-5 text-white pb-safe space-y-4">
          {/* Handle Bar */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

          {/* Header Bottom Sheet */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ReadOutlined className="text-amber-400 text-base" />
              <h3 className="text-sm font-bold text-white">
                Terjemahan Ayat {selectedAyah?.numberInSurah}
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedAyah(null);
                if (isPlayingAudio) {
                  audioRef.current?.pause();
                  setIsPlayingAudio(false);
                }
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
            >
              <CloseOutlined />
            </button>
          </div>

          {/* Teks Arab Ayat */}
          <div
            dir="rtl"
            className="text-right text-amber-200 text-xl font-serif leading-relaxed bg-slate-950 p-4 rounded-2xl border border-amber-900/40"
          >
            {selectedAyah?.text} ﴿{selectedAyah ? toArabicDigits(selectedAyah.numberInSurah) : ''}﴾
          </div>

          {/* Terjemahan Bahasa Indonesia */}
          <div className="space-y-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Terjemahan (Bahasa Indonesia):
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "{selectedAyah?.translation}"
            </p>
          </div>

          {/* Pemutar Audio Murottal */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="primary"
              icon={isPlayingAudio ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleAudio(selectedAyah?.audioUrl)}
              className={`h-11 px-5 rounded-xl font-bold border-none text-xs \${
                isPlayingAudio
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isPlayingAudio ? 'Jeda Audio Murottal' : 'Putar Audio Murottal (Alafasy)'}
            </Button>

            <Button
              onClick={() => setSelectedAyah(null)}
              className="h-11 rounded-xl bg-slate-800 text-slate-300 border-slate-700 text-xs font-bold"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    >
      {null}
    </Modal>
  );
}
