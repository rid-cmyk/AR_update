import React from "react";
import { Avatar, Tag } from "antd";
import { UserOutlined, TrophyOutlined, BookOutlined } from "@ant-design/icons";

interface YayasanSantriModalTitleProps {
  selectedSantri: any;
}

export default function YayasanSantriModalTitle({ selectedSantri }: YayasanSantriModalTitleProps) {
  if (!selectedSantri) return <>Detail Santri</>;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 16,
      padding: '8px 0'
    }}>
      <Avatar
        size={80}
        src={selectedSantri.foto}
        icon={<UserOutlined />}
        style={{ flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Nama Lengkap */}
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Nama Lengkap</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            {selectedSantri.namaLengkap}
          </div>
        </div>
        
        {/* Nama Panggilan */}
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Nama Panggilan</div>
          <div style={{ fontSize: 14, color: '#666' }}>
            {selectedSantri.namaPanggilan || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Data kosong</span>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Halaqah */}
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Halaqah</div>
          <div>
            {selectedSantri.halaqah && selectedSantri.halaqah.length > 0 ? (
              selectedSantri.halaqah.map((h: any, idx: number) => (
                <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                  {h.namaHalaqah}
                </Tag>
              ))
            ) : (
              <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: 14 }}>Data kosong</span>
            )}
          </div>
        </div>

        {/* Peringkat Hafalan */}
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Peringkat Hafalan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {selectedSantri.statistics?.rankingHafalan && selectedSantri.statistics?.totalSantri ? (
              <>
                <TrophyOutlined style={{ 
                  color: selectedSantri.statistics.rankingHafalan === 1 ? '#ffb703' : 
                         selectedSantri.statistics.rankingHafalan === 2 ? '#d9d9d9' : 
                         selectedSantri.statistics.rankingHafalan === 3 ? '#cd7f32' : '#219ebc',
                  fontSize: 18 
                }} />
                <span style={{ 
                  fontSize: 16, 
                  fontWeight: 600, 
                  color: selectedSantri.statistics.rankingHafalan === 1 ? '#ffb703' : 
                         selectedSantri.statistics.rankingHafalan === 2 ? '#8c8c8c' : 
                         selectedSantri.statistics.rankingHafalan === 3 ? '#cd7f32' : '#219ebc'
                }}>
                  Peringkat #{selectedSantri.statistics.rankingHafalan}
                </span>
                <span style={{ fontSize: 12, color: '#999' }}>
                  dari {selectedSantri.statistics.totalSantri} santri
                </span>
              </>
            ) : (
              <>
                <BookOutlined style={{ color: '#219ebc', fontSize: 16 }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#219ebc' }}>
                  {selectedSantri.statistics?.totalAyatHafal || 0} Ayat
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Orang Tua */}
        <div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Orang Tua Terhubung</div>
          <div>
            {selectedSantri.orangTua && selectedSantri.orangTua.length > 0 ? (
              selectedSantri.orangTua.map((ortu: any, idx: number) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#219ebc' }}>
                    {ortu.namaLengkap}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    @{ortu.username}
                    {ortu.noTlp && ` • \${ortu.noTlp}`}
                  </div>
                </div>
              ))
            ) : (
              <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: 14 }}>Data kosong</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
