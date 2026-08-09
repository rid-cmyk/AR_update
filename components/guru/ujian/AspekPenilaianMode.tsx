import React from 'react';
import { Card, Typography, InputNumber, Input, Tag, Button } from 'antd';

const { Title, Text } = Typography;

interface AspekPenilaianModeProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  ujianData: any;
  getCurrentSantriNilai: (itemKey: string) => number;
  handleNilaiChange: (itemKey: string, nilai: number) => void;
  getCurrentSantriCatatan: (itemKey: string) => string;
  handleCatatanItemChange: (itemKey: string, catatan: string) => void;
}

export const AspekPenilaianMode: React.FC<AspekPenilaianModeProps> = ({
  currentPage,
  setCurrentPage,
  ujianData,
  getCurrentSantriNilai,
  handleNilaiChange,
  getCurrentSantriCatatan,
  handleCatatanItemChange
}) => {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="text-center">
          <Title level={4} className="text-white mb-2">
            🎯 Penilaian Per Juz
          </Title>
          <div className="text-2xl font-bold">Juz {currentPage}</div>
        </div>
      </Card>

      <div className="space-y-3">
        {ujianData.jenisUjian.komponenPenilaian.map((komponen: any, index: number) => {
          const itemKey = `juz-${currentPage}-${komponen.nama.toLowerCase().replace(/\s+/g, '_')}`;
          return (
            <Card 
              key={itemKey}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Text strong className="text-lg text-gray-800">{komponen.nama}</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="blue">Bobot: {komponen.bobot}%</Tag>
                      <Tag color="green">Max: {komponen.nilaiMaksimal || 100}</Tag>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Text className="text-sm text-gray-600 font-medium">Nilai:</Text>
                  <InputNumber
                    min={0}
                    max={komponen.nilaiMaksimal || 100}
                    value={getCurrentSantriNilai(itemKey)}
                    onChange={(value) => handleNilaiChange(itemKey, value || 0)}
                    className="w-full"
                    placeholder={`0-${komponen.nilaiMaksimal || 100}`}
                    size="large"
                    style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Text className="text-sm text-gray-600 font-medium">Catatan:</Text>
                  <Input
                    value={getCurrentSantriCatatan(itemKey)}
                    onChange={(e) => handleCatatanItemChange(itemKey, e.target.value)}
                    placeholder={`Catatan untuk ${komponen.nama}...`}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-md bg-white">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, ujianData.juzRange?.dari || 1))}
            disabled={currentPage <= (ujianData.juzRange?.dari || 1)}
            className="flex-1 mr-2"
          >
            ← Juz Sebelumnya
          </Button>
          <div className="text-center px-4">
            <Text strong>Juz {currentPage}</Text>
          </div>
          <Button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, ujianData.juzRange?.sampai || 1))}
            disabled={currentPage >= (ujianData.juzRange?.sampai || 1)}
            className="flex-1 ml-2"
            type="primary"
          >
            Juz Selanjutnya →
          </Button>
        </div>
      </Card>
    </div>
  );
};
