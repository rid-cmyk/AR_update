import React from 'react';
import { Button, Progress } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';

interface FormPenilaianHeaderProps {
  onBack: () => void;
  currentSantri: { nama: string; halaqah: string };
  ujianData: any;
  completionPercent: number;
  nilaiAkhir: number;
}

export const FormPenilaianHeader: React.FC<FormPenilaianHeaderProps> = ({
  onBack,
  currentSantri,
  ujianData,
  completionPercent,
  nilaiAkhir
}) => {
  return (
    <div className="bg-gradient-to-r from-[#023047] via-[#057a55] to-[#023047] border-b border-emerald-600/40 px-6 py-3.5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" />

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="bg-white/15 hover:bg-white/25 border-white/25 text-white px-4 h-10 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center"
          >
            Kembali
          </Button>
          
          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border-2 border-white/30">
              <UserOutlined className="text-white text-lg" />
            </div>
            
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
                  {currentSantri.nama}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm">
                  {ujianData.jenisUjian.nama}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-emerald-100 font-medium flex-wrap">
                <span className="flex items-center gap-1 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {ujianData.juzRange?.dari === ujianData.juzRange?.sampai
                    ? `Juz ${ujianData.juzRange?.dari}`
                    : `Juz ${ujianData.juzRange?.dari} - ${ujianData.juzRange?.sampai}`}
                </span>
                
                <span className="text-emerald-300">•</span>
                
                <span>
                  {ujianData.jenisUjian.tipeUjian === 'per-juz' ? 'Mode Per Juz' : 'Mode Per Halaman'}
                </span>
                
                <span className="text-emerald-300">•</span>
                
                <span className="text-emerald-100">
                  Halaqah: <span className="text-white font-semibold">{currentSantri.halaqah}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white/15 backdrop-blur-md border border-white/25 px-5 py-2 rounded-2xl flex items-center gap-5 shadow-inner">
            <div className="text-left">
              <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider mb-1">
                Total Nilai
              </div>
              <Progress 
                percent={completionPercent} 
                strokeColor="#f59e0b"
                showInfo={false}
                size={6}
                style={{ width: '110px', marginBottom: 0 }}
              />
            </div>
            
            <div className="h-8 w-px bg-white/20" />

            <div className="text-right">
              <span className="text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-sm">
                {nilaiAkhir}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
