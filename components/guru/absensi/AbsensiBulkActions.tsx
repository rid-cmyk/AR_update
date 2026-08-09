import React from "react";
import { Card, Space, Button, Modal, message } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import styles from "./Absensi.module.css";

interface AbsensiBulkActionsProps {
  jadwalsLength: number;
  absensiData: any[];
  handleSaveAbsensi: (santriId: string | number, jadwalId: string | number, status: string) => Promise<void>;
}

export default function AbsensiBulkActions({ jadwalsLength, absensiData, handleSaveAbsensi }: AbsensiBulkActionsProps) {
  if (jadwalsLength === 0) return null;

  return (
    <Card title="Aksi Massal" style={{ marginTop: 16 }}>
      <div className={styles.warningText}>
        ⚠️ Aksi massal hanya akan berhasil jika dalam rentang waktu yang diizinkan
      </div>
      <Space>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'Tandai Semua Hadir',
              content: (
                <div>
                  <div>Apakah Anda yakin ingin menandai semua santri sebagai hadir?</div>
                  <div className={styles.modalSubText}>
                    Hanya santri yang belum diabsen dan sesuai jadwal yang akan diproses.
                  </div>
                </div>
              ),
              onOk: async () => {
                let successCount = 0;
                let errorCount = 0;
                
                for (const record of absensiData) {
                  if (!record.status) {
                    try {
                      await handleSaveAbsensi(record.santriId, record.jadwalId, 'masuk');
                      successCount++;
                    } catch {
                      errorCount++;
                    }
                  }
                }
                
                if (successCount > 0) {
                  message.success(`\${successCount} santri berhasil ditandai hadir`);
                }
                if (errorCount > 0) {
                  message.warning(`\${errorCount} santri gagal diproses (mungkin di luar waktu yang diizinkan)`);
                }
              }
            });
          }}
        >
          Tandai Semua Hadir
        </Button>
        <Button
          icon={<ExclamationCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'Tandai Semua Izin',
              content: (
                <div>
                  <div>Apakah Anda yakin ingin menandai semua santri sebagai izin?</div>
                  <div className={styles.modalSubText}>
                    Hanya santri yang belum diabsen dan sesuai jadwal yang akan diproses.
                  </div>
                </div>
              ),
              onOk: async () => {
                let successCount = 0;
                let errorCount = 0;
                
                for (const record of absensiData) {
                  if (!record.status) {
                    try {
                      await handleSaveAbsensi(record.santriId, record.jadwalId, 'izin');
                      successCount++;
                    } catch {
                      errorCount++;
                    }
                  }
                }
                
                if (successCount > 0) {
                  message.success(`\${successCount} santri berhasil ditandai izin`);
                }
                if (errorCount > 0) {
                  message.warning(`\${errorCount} santri gagal diproses (mungkin di luar waktu yang diizinkan)`);
                }
              }
            });
          }}
        >
          Tandai Semua Izin
        </Button>
      </Space>
    </Card>
  );
}
