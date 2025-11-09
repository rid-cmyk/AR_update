'use client'

import { useState, useEffect } from 'react'
import { Card, Form, InputNumber, Input, Button, Typography, Row, Col, Tag, Divider, Space, Alert, Progress } from 'antd'
import { SaveOutlined, CheckOutlined, BookOutlined, StarOutlined } from '@ant-design/icons'
import { MushafDigital } from './MushafDigital'

const { Title, Text } = Typography
const { TextArea } = Input

interface PenilaianData {
  halaman?: number;
  juz?: number;
  nilai: number;
  catatan?: string;
}

interface FormPenilaianWithMushafProps {
  santri: {
    id: string;
    nama: string;
    halaqah: string;
  };
  jenisUjian: {
    nama: string;
    tipeUjian: 'per-juz' | 'per-halaman';
    juzMulai: number;
    juzSampai: number;
    komponenPenilaian?: Array<{
      nama: string;
      bobot: number;
      nilaiMaksimal: number;
    }>;
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export function FormPenilaianWithMushaf({
  santri,
  jenisUjian,
  onSubmit,
  onBack
}: FormPenilaianWithMushafProps) {
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentJuz, setCurrentJuz] = useState(jenisUjian.juzMulai);
  const [penilaianData, setPenilaianData] = useState<Record<string, PenilaianData>>({});
  const [loading, setLoading] = useState(false);

  // Generate halaman atau juz list berdasarkan tipe ujian
  const generatePenilaianItems = () => {
    const items = [];
    
    if (jenisUjian.tipeUjian === 'per-juz') {
      for (let juz = jenisUjian.juzMulai; juz <= jenisUjian.juzSampai; juz++) {
        items.push({
          key: `juz-${juz}`,
          label: `Juz ${juz}`,
          type: 'juz',
          number: juz
        });
      }
    } else {
      // Per halaman - simplified mapping
      const juzPageMapping: Record<number, { start: number; end: number }> = {
        1: { start: 1, end: 21 },
        2: { start: 22, end: 41 },
        3: { start: 42, end: 61 },
        // Add more mappings
        30: { start: 582, end: 604 }
      };

      for (let juz = jenisUjian.juzMulai; juz <= jenisUjian.juzSampai; juz++) {
        const juzInfo = juzPageMapping[juz] || { 
          start: (juz - 1) * 20 + 1, 
          end: juz * 20 
        };
        
        for (let page = juzInfo.start; page <= juzInfo.end; page++) {
          items.push({
            key: `halaman-${page}`,
            label: `Halaman ${page}`,
            type: 'halaman',
            number: page,
            juz: juz
          });
        }
      }
    }
    
    return items;
  };

  const penilaianItems = generatePenilaianItems();

  const handleNilaiChange = (key: string, field: string, value: any) => {
    setPenilaianData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const nilaiList = Object.entries(penilaianData).map(([key, data]) => ({
        key,
        ...data
      }));

      const totalNilai = nilaiList.reduce((sum, item) => sum + (item.nilai || 0), 0);
      const rataRata = nilaiList.length > 0 ? totalNilai / nilaiList.length : 0;

      const submitData = {
        santriId: santri.id,
        jenisUjian: jenisUjian.nama,
        tipeUjian: jenisUjian.tipeUjian,
        juzMulai: jenisUjian.juzMulai,
        juzSampai: jenisUjian.juzSampai,
        nilaiDetail: nilaiList,
        nilaiAkhir: Math.round(rataRata),
        tanggalUjian: new Date().toISOString(),
        catatan: form.getFieldValue('catatanUmum') || ''
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting penilaian:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const totalItems = penilaianItems.length;
    const completedItems = Object.keys(penilaianData).filter(key => 
      penilaianData[key]?.nilai !== undefined && penilaianData[key]?.nilai > 0
    ).length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getRataRataNilai = () => {
    const nilaiList = Object.values(penilaianData).filter(data => data.nilai > 0);
    if (nilaiList.length === 0) return 0;
    
    const total = nilaiList.reduce((sum, data) => sum + data.nilai, 0);
    return Math.round(total / nilaiList.length);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="text-white mb-2">
              Form Penilaian Ujian - {jenisUjian.nama}
            </Title>
            <div className="flex items-center gap-4">
              <Tag color="blue" className="text-sm">
                {santri.nama} - {santri.halaqah}
              </Tag>
              <Tag color="green" className="text-sm">
                Juz {jenisUjian.juzMulai}-{jenisUjian.juzSampai}
              </Tag>
              <Tag color="orange" className="text-sm">
                {jenisUjian.tipeUjian === 'per-juz' ? 'Per Juz' : 'Per Halaman'}
              </Tag>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{getRataRataNilai()}</div>
            <div className="text-sm opacity-90">Rata-rata Nilai</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Text className="text-white text-sm">Progress Penilaian</Text>
            <Text className="text-white text-sm">{getProgress()}%</Text>
          </div>
          <Progress 
            percent={getProgress()} 
            strokeColor="#52c41a"
            trailColor="rgba(255,255,255,0.3)"
            showInfo={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Mushaf Digital */}
        <div className="w-1/2 p-4 border-r border-gray-200 overflow-auto">
          <MushafDigital
            juzMulai={jenisUjian.juzMulai}
            juzSampai={jenisUjian.juzSampai}
            tipeUjian={jenisUjian.tipeUjian}
            currentPage={currentPage}
            currentJuz={currentJuz}
            onPageChange={setCurrentPage}
            onJuzChange={setCurrentJuz}
            className="h-full"
          />
        </div>

        {/* Right Side - Form Penilaian */}
        <div className="w-1/2 p-4 overflow-auto">
          {/* Juz Navigation - Show if multiple juz */}
          {jenisUjian.juzSampai > jenisUjian.juzMulai && (
            <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <Button
                  size="large"
                  disabled={currentJuz <= jenisUjian.juzMulai}
                  onClick={() => {
                    const prevJuz = currentJuz - 1;
                    setCurrentJuz(prevJuz);
                    // Jump to first page of previous juz
                    const juzPageMapping: Record<number, number> = {
                      1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
                      11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
                      21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582
                    };
                    setCurrentPage(juzPageMapping[prevJuz] || 1);
                  }}
                  icon={<span>←</span>}
                >
                  Juz Sebelumnya
                </Button>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    📚 Juz {currentJuz}
                  </div>
                  <div className="text-sm text-gray-600">
                    dari {jenisUjian.juzMulai} - {jenisUjian.juzSampai}
                  </div>
                </div>
                
                <Button
                  size="large"
                  type="primary"
                  disabled={currentJuz >= jenisUjian.juzSampai}
                  onClick={() => {
                    const nextJuz = currentJuz + 1;
                    setCurrentJuz(nextJuz);
                    // Jump to first page of next juz
                    const juzPageMapping: Record<number, number> = {
                      1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
                      11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
                      21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582
                    };
                    setCurrentPage(juzPageMapping[nextJuz] || 1);
                  }}
                  icon={<span>→</span>}
                >
                  Juz Selanjutnya
                </Button>
              </div>
            </Card>
          )}
          
          <Card 
            title={
              <div className="flex items-center gap-2">
                <StarOutlined className="text-yellow-500" />
                <span>Aspek Penilaian - Juz {currentJuz}</span>
              </div>
            }
            className="h-full"
          >
            <Form form={form} layout="vertical" className="space-y-4">
              {/* Penilaian Items - Filtered by current juz */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {penilaianItems
                  .filter(item => {
                    // Filter by current juz
                    if (jenisUjian.tipeUjian === 'per-juz') {
                      return item.number === currentJuz;
                    } else {
                      // Per halaman - show pages from current juz
                      return item.juz === currentJuz;
                    }
                  })
                  .map((item) => (
                  <Card 
                    key={item.key}
                    size="small"
                    className="border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOutlined className="text-blue-500" />
                        <Text strong>{item.label}</Text>
                        {item.type === 'halaman' && (
                          <Tag size="small" color="blue">Juz {item.juz}</Tag>
                        )}
                      </div>
                      <Button
                        size="small"
                        type={currentPage === item.number ? 'primary' : 'default'}
                        onClick={() => setCurrentPage(item.number)}
                      >
                        Lihat
                      </Button>
                    </div>
                    
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="Nilai (0-100)" className="mb-2">
                          <InputNumber
                            min={0}
                            max={100}
                            value={penilaianData[item.key]?.nilai || 0}
                            onChange={(value) => handleNilaiChange(item.key, 'nilai', value || 0)}
                            className="w-full"
                            placeholder="0"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item label="Catatan" className="mb-2">
                          <Input
                            value={penilaianData[item.key]?.catatan || ''}
                            onChange={(e) => handleNilaiChange(item.key, 'catatan', e.target.value)}
                            placeholder="Catatan penilaian..."
                            size="small"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              <Divider />

              {/* Catatan Umum */}
              <Form.Item label="Catatan Umum" name="catatanUmum">
                <TextArea
                  rows={3}
                  placeholder="Catatan umum untuk ujian ini..."
                />
              </Form.Item>

              {/* Summary */}
              <Alert
                message="Ringkasan Penilaian"
                description={
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Item:</span>
                      <span className="font-semibold">{penilaianItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sudah Dinilai:</span>
                      <span className="font-semibold">
                        {Object.keys(penilaianData).filter(key => 
                          penilaianData[key]?.nilai !== undefined && penilaianData[key]?.nilai > 0
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata Nilai:</span>
                      <span className="font-semibold text-blue-600">{getRataRataNilai()}</span>
                    </div>
                  </div>
                }
                type="info"
                showIcon
              />

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button onClick={onBack} size="large">
                  Kembali
                </Button>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                    size="large"
                    disabled={getProgress() === 0}
                  >
                    Simpan Penilaian
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}