import React from 'react'
import { Card, Row, Col, Form, Select, InputNumber, Typography } from 'antd'
import styles from './FormUjianWizard.module.css'

const { Text } = Typography

export interface JenisUjian {
  id: string
  nama: string
  deskripsi: string
  tipeUjian: 'per-halaman' | 'per-juz'
  jenisUjian: string
  komponenPenilaian: Array<{
    nama: string
    bobot: number
    nilaiMaksimal?: number
  }>
}

interface PilihJenisUjianStepProps {
  jenisUjianList: JenisUjian[]
  selectedJenisUjian: JenisUjian | null
  setSelectedJenisUjian: (jenis: JenisUjian | null) => void
  juzRange: { dari: number; sampai: number }
  setJuzRange: React.Dispatch<React.SetStateAction<{ dari: number; sampai: number }>>
  jumlahPertanyaanPerJuz: number
  setJumlahPertanyaanPerJuz: (value: number) => void
}

export function PilihJenisUjianStep({
  jenisUjianList,
  selectedJenisUjian,
  setSelectedJenisUjian,
  juzRange,
  setJuzRange,
  jumlahPertanyaanPerJuz,
  setJumlahPertanyaanPerJuz
}: PilihJenisUjianStepProps) {
  return (
    <Card 
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#023047] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            2
          </div>
          <div>
            <div className="text-base font-bold text-slate-800">Pilih Jenis Ujian &amp; Rentang Juz</div>
            <div className="text-xs text-slate-500 font-normal">Tentukan skema penilaian dan bab hafalan yang akan diujikan</div>
          </div>
        </div>
      }
      className={styles.stepCard}
      styles={{ body: { padding: '24px' } }}
    >
      <Row gutter={[28, 28]}>
        {/* Left Column - Minimalist Input Form (13/24) */}
        <Col xs={24} lg={13}>
          {/* 1. Pilih Jenis Ujian */}
          <div className={styles.sectionBox}>
            <Form.Item
              label={
                <Text strong className={styles.sectionTitle}>
                  🎯 1. Jenis Ujian &amp; Skema Evaluasi
                </Text>
              }
              required
              className={styles.marginB0}
            >
              <Select
                placeholder="Pilih jenis ujian"
                value={selectedJenisUjian?.id}
                optionLabelProp="label"
                styles={{ popup: { root: { minWidth: 440, padding: '8px 10px', borderRadius: '14px' } } }}
                listHeight={380}
                onChange={(value) => {
                  const jenisUjian = jenisUjianList.find(j => j.id === value)
                  setSelectedJenisUjian(jenisUjian || null)
                  setJuzRange({ dari: 1, sampai: 1 })
                }}
                size="large"
                style={{ width: '100%' }}
              >
                {jenisUjianList.map(jenis => (
                  <Select.Option 
                    key={jenis.id} 
                    value={jenis.id}
                    label={`${jenis.nama} - ${jenis.tipeUjian === 'per-juz' ? 'Mode Per Juz' : 'Mode Per Halaman'}`}
                  >
                    <div className={styles.selectItem}>
                      <div className={styles.selectItemHeader}>
                        <div className={styles.selectItemTitle}>
                          {jenis.nama}
                        </div>
                        <span className={`${styles.selectItemTypeTag} ${jenis.tipeUjian === 'per-juz' ? styles.perJuzType : styles.perHalamanType}`}>
                          {jenis.tipeUjian === 'per-juz' ? '📚 Mode Per Juz' : '📄 Mode Per Halaman'}
                        </span>
                      </div>
                      <div className={styles.selectItemDesc}>
                        {jenis.deskripsi}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {selectedJenisUjian && (
            <>
              {/* 2. Rentang Juz - Clean Minimalist Card */}
              <div className={styles.sectionBox}>
                <div className={styles.marginB16}>
                  <Text strong className={styles.sectionTitle}>
                    📚 2. Rentang Juz yang Diujikan
                  </Text>
                  <Text className={styles.sectionSubTitle}>
                    Tentukan batas awal dan akhir juz hafalan santri
                  </Text>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label={<Text strong className={styles.juzLabel}>Dari Juz</Text>} className={styles.marginB0}>
                      <InputNumber
                        min={1}
                        max={30}
                        value={juzRange.dari}
                        onChange={(value) => setJuzRange(prev => ({ ...prev, dari: value || 1 }))}
                        style={{ width: '100%' }}
                        size="large"
                        prefix="📖"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<Text strong className={styles.juzLabel}>Sampai Juz</Text>} className={styles.marginB0}>
                      <InputNumber
                        min={juzRange.dari}
                        max={30}
                        value={juzRange.sampai}
                        onChange={(value) => setJuzRange(prev => ({ ...prev, sampai: value || 1 }))}
                        style={{ width: '100%' }}
                        size="large"
                        prefix="📖"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div className={`${styles.infoTag} ${styles.juzInfoTag}`}>
                  <span>✨ Total Rentang: {Math.max(1, juzRange.sampai - juzRange.dari + 1)} Juz</span>
                  <span className={styles.juzInfoSpan}>
                    (Juz {juzRange.dari} {juzRange.sampai > juzRange.dari ? `- ${juzRange.sampai}` : ''})
                  </span>
                </div>
              </div>

              {/* 3. Jumlah Pertanyaan Per Juz (Khusus MHQ) - Clean Minimalist Card */}
              {(selectedJenisUjian.tipeUjian === 'per-juz' || selectedJenisUjian.nama?.toLowerCase().includes('mhq') || selectedJenisUjian.id === 'mhq') && (
                <div className={styles.sectionBox}>
                  <div className={styles.marginB16}>
                    <Text strong className={styles.sectionTitle}>
                      ❓ 3. Jumlah Pertanyaan Per Juz (MHQ)
                    </Text>
                    <Text className={styles.sectionSubTitle}>
                      Tentukan banyaknya pertanyaan yang diujikan di setiap juz
                    </Text>
                  </div>

                  <Form.Item className={styles.marginB0}>
                    <InputNumber
                      min={1}
                      max={3}
                      value={jumlahPertanyaanPerJuz}
                      onChange={(value) => setJumlahPertanyaanPerJuz(Math.min(3, Math.max(1, value || 1)))}
                      style={{ width: '100%' }}
                      size="large"
                      prefix="❓"
                      addonAfter="pertanyaan / juz"
                    />
                  </Form.Item>

                  <div className={`${styles.infoTag} ${styles.mhqInfoTag}`}>
                    <span>📖 Total Pertanyaan: {Math.max(1, (juzRange.sampai - juzRange.dari + 1) * jumlahPertanyaanPerJuz)} soal</span>
                    <span className={styles.mhqInfoSpan}>
                      ({juzRange.sampai - juzRange.dari + 1} juz × {jumlahPertanyaanPerJuz} soal per juz)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </Col>

        {/* Right Column - Minimalist Unified Aspek & Bobot Penilaian Panel (11/24) */}
        <Col xs={24} lg={11}>
          {selectedJenisUjian ? (
            <div className={styles.aspekBox}>
              {/* Top Header Strip */}
              <div className={styles.aspekHeader}>
                <div className={styles.aspekHeaderLeft}>
                  <div className={styles.aspekIcon}>
                    📋
                  </div>
                  <div>
                    <div className={styles.aspekTitle}>
                      Aspek &amp; Bobot Penilaian
                    </div>
                    <div className={styles.aspekSubTitle}>
                      Skema evaluasi untuk jenis ujian ini
                    </div>
                  </div>
                </div>

                <span className={styles.aspekTypeTag}>
                  {selectedJenisUjian.tipeUjian === 'per-juz' ? '📚 Per Juz' : '📄 Per Halaman'}
                </span>
              </div>

              {/* Selected Exam Title & Desc */}
              <div className={styles.marginB20}>
                <div className={styles.ujianTitle}>
                  {selectedJenisUjian.nama}
                </div>
                <div className={styles.ujianDesc}>
                  {selectedJenisUjian.deskripsi}
                </div>
              </div>

              {/* Minimalist Komponen Penilaian Rows */}
              <div className={styles.marginB8}>
                <div className={styles.komponenHeader}>
                  Komponen Penilaian ({selectedJenisUjian.komponenPenilaian.length} Aspek)
                </div>

                <div className={styles.komponenList}>
                  {selectedJenisUjian.komponenPenilaian.map((komponen, index) => (
                    <div 
                      key={index}
                      className={styles.komponenItem}
                    >
                      <div>
                        <div className={styles.komponenName}>
                          {komponen.nama}
                        </div>
                        <div className={styles.komponenMax}>
                          Nilai Maksimal: <strong>{komponen.nilaiMaksimal}</strong>
                        </div>
                      </div>

                      <div className={styles.komponenBobot}>
                        Bobot: {komponen.bobot}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Note below aspect list */}
              <div className={styles.infoNoteBox}>
                <span className={styles.infoNoteIcon}>💡</span>
                <div className={styles.infoNoteText}>
                  {selectedJenisUjian.tipeUjian === 'per-juz' ? (
                    <span>Sistem akan otomatis menghitung nilai akhir santri berdasarkan bobot persentase dari setiap komponen penilaian di atas.</span>
                  ) : (
                    <span>Sistem akan membagi evaluasi per halaman untuk setiap juz yang dipilih dan menghitung rata-rata nilai akhir secara akurat.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyAspekBox}>
              <div className={styles.emptyAspekIcon}>📋</div>
              <div className={styles.emptyAspekTitle}>
                Belum Ada Jenis Ujian Dipilih
              </div>
              <div className={styles.emptyAspekDesc}>
                Silakan pilih jenis ujian di samping untuk melihat skema evaluasi dan aspek penilaiannya.
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}
