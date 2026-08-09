import React from 'react';
import { Card, Typography, Input, Progress, Button } from 'antd';
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface FormPenilaianSummaryProps {
  currentSantriId: string;
  penilaianData: any;
  penilaianItemsLength: number;
  getCurrentSantriCatatan: () => string;
  handleCatatanChange: (catatan: string) => void;
  handleSubmit: (status: 'DRAFT' | 'SELESAI') => void;
  loading: boolean;
  canSubmit: () => boolean;
}

export const FormPenilaianSummary: React.FC<FormPenilaianSummaryProps> = ({
  currentSantriId,
  penilaianData,
  penilaianItemsLength,
  getCurrentSantriCatatan,
  handleCatatanChange,
  handleSubmit,
  loading,
  canSubmit
}) => {
  const getSudahDinilaiCount = () => {
    return Object.keys(penilaianData[currentSantriId]?.nilai || {}).filter(key => 
      (penilaianData[currentSantriId]?.nilai?.[key] || 0) > 0
    ).length;
  };

  const getCompletionPercent = () => {
    return Math.round((getSudahDinilaiCount() / Math.max(penilaianItemsLength, 1)) * 100);
  };

  return (
    <div className="pt-6 mt-8 border-t border-slate-200/90">
      <div style={{ height: '16px' }} />

      <Card 
        className="border border-amber-200/90 shadow-sm transition-all hover:shadow" 
        style={{ 
          borderRadius: '16px', 
          background: '#ffffff',
          marginBottom: '28px'
        }}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">📝</span>
            </div>
            <div>
              <Title level={5} className="mb-0 text-slate-800 font-bold tracking-tight">
                Catatan Umum & Evaluasi
              </Title>
              <Text className="text-[11px] text-slate-500">Masukan atau nasehat untuk santri ini</Text>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            Opsional
          </span>
        </div>
        <TextArea
          rows={3}
          value={getCurrentSantriCatatan()}
          onChange={(e) => handleCatatanChange(e.target.value)}
          placeholder="Berikan catatan, nasehat, atau evaluasi bacaan santri di sini..."
          style={{ 
            borderRadius: '12px',
            fontSize: '14px',
            background: '#ffffff',
            border: '1px solid #fde68a',
            padding: '12px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
      </Card>

      <div style={{ height: '28px', width: '100%', display: 'block' }} />

      <Card 
        className="border border-emerald-200/80 shadow-md relative overflow-hidden" 
        style={{ 
          borderRadius: '16px', 
          background: '#f0fdf4',
          marginTop: '8px',
          marginBottom: '32px'
        }}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#023047] to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <div>
              <Title level={5} className="mb-0 text-emerald-950 font-bold tracking-tight">
                Ringkasan Penilaian
              </Title>
              <Text className="text-[11px] text-emerald-700/80 font-medium">Progres evaluasi santri</Text>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#023047] text-white shadow-sm">
            {getCompletionPercent()}% Selesai
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
          <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Item</div>
            <div className="text-2xl font-bold text-slate-800">{penilaianItemsLength}</div>
          </div>
          <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Sudah Dinilai</div>
            <div className="text-2xl font-extrabold text-[#023047]">
              {getSudahDinilaiCount()}
            </div>
          </div>
          <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Belum Dinilai</div>
            <div className="text-2xl font-extrabold text-amber-600">
              {Math.max(0, penilaianItemsLength - getSudahDinilaiCount())}
            </div>
          </div>
        </div>
        
        <Progress 
          percent={getCompletionPercent()} 
          strokeColor={{
            '0%': '#219ebc',
            '100%': '#023047',
          }}
          size={8}
          showInfo={false}
          className="mb-4 relative z-10"
        />
        
        <div className="flex gap-3 pt-1 relative z-10">
          <Button 
            type="default"
            icon={<SaveOutlined />}
            onClick={() => handleSubmit('DRAFT')}
            loading={loading}
            size="large"
            style={{
              flex: 1,
              height: '48px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1.5px solid #f59e0b',
              color: '#b45309',
              background: '#fffbeb'
            }}
          >
            ⏸️ Pause (Draft)
          </Button>
          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleSubmit('SELESAI')}
            loading={loading}
            size="large"
            disabled={!canSubmit()}
            style={{
              flex: 1,
              height: '48px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '12px',
              background: canSubmit() ? '#023047' : undefined,
              border: 'none',
              boxShadow: canSubmit() ? '0 4px 14px rgba(4, 108, 78, 0.35)' : undefined
            }}
          >
            {loading ? 'Menyimpan...' : canSubmit() ? '✅ Selesaikan' : '⏳ Belum Lengkap'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
