import React from "react";
import { Row, Col, Card } from "antd";
import dayjs from "dayjs";
import styles from "@/app/(dashboard)/ortu/absensi/AbsensiAnak.module.css";

interface ChildAttendanceStats {
  namaLengkap: string;
  totalKehadiran: number;
  totalIzin: number;
  totalAlpha: number;
  totalSakit: number;
  totalAbsensi: number;
  persentaseKehadiran: number;
  persentaseAlpha: number;
  streakHadir: number;
  bulanIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
  semesterIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
}

interface SemesterSummaryCardsProps {
  childStats: ChildAttendanceStats[];
  selectedChild: string;
}

export default function SemesterSummaryCards({ childStats, selectedChild }: SemesterSummaryCardsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {childStats
        .filter(child => !selectedChild || child.namaLengkap === selectedChild)
        .map((child, index) => (
        <Col xs={24} key={index}>
          <Card className={styles.semesterCard}>
            <div className={styles.semesterHeader}>
              <div className={styles.semesterHeaderTitle}>
                📊 Ringkasan Kehadiran {child.namaLengkap}
              </div>
              <div className={styles.semesterHeaderSubtitle}>
                Statistik lengkap semester ini
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className={styles.monthlySummary}>
                  <div className={styles.summaryTitle}>
                    📅 Bulan Ini ({dayjs().format('MMMM YYYY')})
                  </div>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueHadir}>
                          {child.bulanIni.hadir}
                        </div>
                        <div className={styles.summaryBoxLabel}>Hadir</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueAlpha}>
                          {child.bulanIni.alpha}
                        </div>
                        <div className={styles.summaryBoxLabel}>Alpha</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueIzin}>
                          {child.bulanIni.izin}
                        </div>
                        <div className={styles.summaryBoxLabel}>Izin</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueSakit}>
                          {child.bulanIni.sakit}
                        </div>
                        <div className={styles.summaryBoxLabel}>Sakit</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className={styles.semesterSummary}>
                  <div className={styles.summaryTitle}>
                    📈 Semester Ini (6 Bulan Terakhir)
                  </div>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueHadir}>
                          {child.semesterIni.hadir}
                        </div>
                        <div className={styles.summaryBoxLabel}>Hadir</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueAlpha}>
                          {child.semesterIni.alpha}
                        </div>
                        <div className={styles.summaryBoxLabel}>Alpha</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueIzin}>
                          {child.semesterIni.izin}
                        </div>
                        <div className={styles.summaryBoxLabel}>Izin</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.summaryBox}>
                        <div className={styles.summaryBoxValueSakit}>
                          {child.semesterIni.sakit}
                        </div>
                        <div className={styles.summaryBoxLabel}>Sakit</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {/* Achievement Badge */}
            <div className={styles.achievementBadgeContainer}>
              <div className={styles.achievementTitle}>
                🏆 Pencapaian Kehadiran
              </div>
              <div className={styles.achievementTags}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: child.totalKehadiran >= 40 ? '#219ebc' : child.totalKehadiran >= 30 ? '#ffb703' : '#fb8500',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  📊 {child.totalKehadiran} Hari Hadir
                </div>
                <div className={styles.achievementTagStreak}>
                  🔥 Streak {child.streakHadir} hari
                </div>
                {child.totalAlpha <= 2 && (
                  <div className={styles.achievementTagAlpha}>
                    ⭐ Alpha Rendah
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
