import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { InfoCircleOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProfileInfoCardProps {
  profile: any;
  roleInfo: any;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ profile, roleInfo }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Personal Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: roleInfo.color }} />
            <span>Informasi Personal</span>
          </div>
        }
        style={{ borderRadius: '12px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Nama Lengkap
              </Text>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginTop: 4 }}>
                {profile.namaLengkap}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Username
              </Text>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginTop: 4 }}>
                {profile.username}
              </div>
            </div>
          </Col>
          {profile.email && (
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Email
                </Text>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginTop: 4 }}>
                  {profile.email}
                </div>
              </div>
            </Col>
          )}
          {profile.noTlp && (
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  No. Telepon
                </Text>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginTop: 4 }}>
                  {profile.noTlp}
                </div>
              </div>
            </Col>
          )}
          {profile.alamat && (
            <Col xs={24}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Alamat
                </Text>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginTop: 4 }}>
                  {profile.alamat}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Permissions */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: roleInfo.color }} />
            <span>Hak Akses & Fitur</span>
          </div>
        }
        style={{ borderRadius: '12px' }}
      >
        <Row gutter={[12, 12]}>
          {roleInfo.permissions.map((permission: string, index: number) => (
            <Col xs={24} sm={12} key={index}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: `${roleInfo.color}10`, 
                borderRadius: 6,
                border: `1px solid ${roleInfo.color}30`
              }}>
                <CheckCircleOutlined style={{ color: roleInfo.color, fontSize: 16 }} />
                <Text style={{ fontSize: 14, fontWeight: 500 }}>
                  {permission}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};
