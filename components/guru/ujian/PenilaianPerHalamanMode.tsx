import React from 'react';
import { Card, Typography, InputNumber, Button } from 'antd';

const { Title, Text } = Typography;

interface PenilaianPerHalamanModeProps {
  currentJuz: number;
  getCurrentJuzPages: () => { start: number; end: number };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  getCurrentSantriNilai: (itemKey: string) => number;
  handleNilaiChange: (itemKey: string, nilai: number) => void;
  handlePrevJuz: () => void;
  handleNextJuz: () => void;
  ujianData: any;
}

export const PenilaianPerHalamanMode: React.FC<PenilaianPerHalamanModeProps> = ({
  currentJuz,
  getCurrentJuzPages,
  currentPage,
  setCurrentPage,
  getCurrentSantriNilai,
  handleNilaiChange,
  handlePrevJuz,
  handleNextJuz,
  ujianData
}) => {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="text-center">
          <Title level={4} className="text-white mb-2">
            📄 Penilaian Per Halaman
          </Title>
          <div className="text-xl font-bold">Juz {currentJuz}</div>
          <div className="text-sm opacity-90">Halaman {getCurrentJuzPages().start} - {getCurrentJuzPages().end}</div>
        </div>
      </Card>

      <Card className="border-0 shadow-md bg-white">
        <Title level={5} className="mb-4 text-center text-gray-800">
          📊 Nilai Per Halaman - Juz {currentJuz}
        </Title>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {Array.from({ length: getCurrentJuzPages().end - getCurrentJuzPages().start + 1 }, (_, i) => {
            const pageNum = getCurrentJuzPages().start + i
            const itemKey = `halaman-${pageNum}`
            return (
              <div 
                key={pageNum}
                className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  currentPage === pageNum 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${
                    currentPage === pageNum 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pageNum}
                  </div>
                  <InputNumber
                    min={0}
                    max={100}
                    value={getCurrentSantriNilai(itemKey)}
                    onChange={(value) => handleNilaiChange(itemKey, value || 0)}
                    className="w-full"
                    placeholder="0-100"
                    size="small"
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            onClick={handlePrevJuz}
            disabled={currentJuz <= (ujianData.juzRange?.dari || 1)}
            className="flex-1 mr-2"
          >
            ← Juz {currentJuz - 1}
          </Button>
          <div className="text-center px-4">
            <Text strong className="text-lg">Juz {currentJuz}</Text>
            <div className="text-xs text-gray-500">
              {currentJuz - (ujianData.juzRange?.dari || 1) + 1} dari {(ujianData.juzRange?.sampai || 1) - (ujianData.juzRange?.dari || 1) + 1}
            </div>
          </div>
          <Button
            onClick={handleNextJuz}
            disabled={currentJuz >= (ujianData.juzRange?.sampai || 1)}
            className="flex-1 ml-2"
            type="primary"
          >
            Juz {currentJuz + 1} →
          </Button>
        </div>
      </Card>
    </div>
  );
};
