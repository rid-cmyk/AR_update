'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Tag, 
  Button, 
  Modal, 
  Input, 
  Form, 
  message, 
  Spin, 
  Badge 
} from "antd";
import { 
  UserOutlined, 
  EditOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  KeyOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { ProfileEditModal } from './ProfileEditModal';
import { ProfileInfoCard } from './ProfileInfoCard';

const { Title, Text, Paragraph } = Typography;

interface UserProfile {
  id: number;
  username: string;
  namaLengkap: string;
  email?: string;
  noTlp?: string;
  alamat?: string;
  foto?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  assignedSantris?: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
  halaqah?: {
    namaHalaqah: string;
    guru?: {
      namaLengkap: string;
    };
  };
}

interface UnifiedProfileProps {
  userRole: string;
}

const canEditSelfPasscode = (userRole: string): boolean => {
  return ['super_admin', 'admin'].includes(userRole.toLowerCase());
};

const canEditPhoto = (userRole: string): boolean => {
  return userRole.toLowerCase() !== 'santri';
};

export const UnifiedProfile: React.FC<UnifiedProfileProps> = ({ userRole }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [form] = Form.useForm();
  
  const canEditPasscodePermission = canEditSelfPasscode(userRole);
  const canEditPhotoPermission = canEditPhoto(userRole);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setProfile(data.user);
        form.setFieldsValue({
          ...data.user,
          username: data.user.username // Ensure passcode is filled
        });
      } else {
        message.error('Gagal memuat profil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Terjadi kesalahan saat memuat profil');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleLogout = async () => {
    try {
      message.loading({ content: 'Sedang logout...', key: 'logout' });
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      message.error({ content: 'Gagal logout. Silakan coba lagi.', key: 'logout' });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (values: Record<string, unknown>) => {
    try {
      const payload = {
        ...values,
        passCode: values.username
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success('Profil berhasil diperbarui! Silakan login ulang jika mengubah passcode.');
        setProfile(data.user);
        setEditModalOpen(false);
        fetchProfile();
      } else {
        message.error(data.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Terjadi kesalahan saat memperbarui profil');
    }
  };

  const getRoleInfo = () => {
    const roleConfig = {
      super_admin: {
        title: 'Super Administrator',
        description: 'Akses penuh ke seluruh sistem AR-Hafalan',
        color: '#8ecae6',
        icon: <IdcardOutlined />,
        permissions: ['Kelola semua user', 'Backup database', 'System monitoring', 'Reset password']
      },
      admin: {
        title: 'Administrator',
        description: 'Mengelola sistem pesantren dan data santri',
        color: '#219ebc',
        icon: <TeamOutlined />,
        permissions: ['Kelola halaqah', 'Template ujian', 'Generate raport', 'Verifikasi ujian']
      },
      guru: {
        title: 'Guru/Ustadz',
        description: 'Mengajar dan menilai hafalan santri',
        color: '#219ebc',
        icon: <BookOutlined />,
        permissions: ['Penilaian ujian', 'Data hafalan', 'Target hafalan', 'Absensi santri']
      },
      santri: {
        title: 'Santri',
        description: 'Siswa pesantren yang menghafal Al-Quran',
        color: '#13c2c2',
        icon: <UserOutlined />,
        permissions: ['Lihat hafalan', 'Lihat raport', 'Absensi', 'Notifikasi']
      },
      ortu: {
        title: 'Orang Tua',
        description: 'Memantau perkembangan hafalan anak',
        color: '#ffb703',
        icon: <HomeOutlined />,
        permissions: ['Monitor anak', 'Lihat raport', 'Progres hafalan', 'Komunikasi guru']
      },
      yayasan: {
        title: 'Yayasan',
        description: 'Mengawasi operasional pesantren',
        color: '#eb2f96',
        icon: <TeamOutlined />,
        permissions: ['Laporan hafalan', 'Grafik progress', 'Monitor aktivitas', 'Rekap absensi']
      }
    };

    return roleConfig[userRole as keyof typeof roleConfig] || roleConfig.santri;
  };

  const roleInfo = getRoleInfo();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Title level={3}>Profil tidak ditemukan</Title>
        <Button type="primary" onClick={fetchProfile}>
          Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} lg={8}>
            <Card 
              style={{ 
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <Avatar
                  size={120}
                  src={profile.foto}
                  icon={!profile.foto ? <UserOutlined /> : undefined}
                  style={{
                    border: `4px solid ${roleInfo.color}`,
                    boxShadow: `0 4px 20px ${roleInfo.color}30`
                  }}
                />
                <Badge
                  count={<CheckCircleOutlined style={{ color: '#219ebc' }} />}
                  style={{ 
                    position: 'absolute',
                    bottom: 10,
                    right: 'calc(50% - 45px)' 
                  }}
                />
                {!canEditPhotoPermission && (
                  <div style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff2e8',
                    border: '1px solid #ffbb96',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 10,
                    color: '#ffb703'
                  }}>
                    Foto dikelola Super Admin
                  </div>
                )}
              </div>

              <Title level={3} style={{ marginBottom: 8, color: '#1f2937' }}>
                {profile.namaLengkap}
              </Title>

              <Tag 
                color={roleInfo.color} 
                icon={roleInfo.icon}
                style={{ 
                  fontSize: 14,
                  padding: '6px 16px',
                  borderRadius: 20,
                  marginBottom: 16
                }}
              >
                {roleInfo.title}
              </Tag>

              <Paragraph 
                type="secondary" 
                style={{ 
                  fontSize: 14,
                  marginBottom: 24,
                  lineHeight: 1.6
                }}
              >
                {roleInfo.description}
              </Paragraph>

              {/* Passcode Section with Permission Control */}
              <Card 
                size="small" 
                style={{ 
                  background: 'transparent',
                  border: canEditPasscodePermission 
                    ? '1px solid #b7eb8f' 
                    : '1px solid #ffd591',
                  marginBottom: 16
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between' 
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 
                  }}>
                    <KeyOutlined style={{ 
                      color: canEditPasscodePermission ? '#219ebc' : '#ffb703' 
                    }} />
                    <Text strong>Passcode:</Text>
                    {!canEditPasscodePermission && (
                      <Tag color="orange" style={{ fontSize: "12px", padding: "0 8px" }}>View Only</Tag>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 
                  }}>
                    <Text 
                      code 
                      style={{ 
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: passcodeVisible ? '#1f2937' : 'transparent',
                        textShadow: passcodeVisible ? 'none' : '0 0 8px #1f2937',
                        userSelect: passcodeVisible ? 'text' : 'none'
                      }}
                    >
                      {profile.username}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={passcodeVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={() => setPasscodeVisible(!passcodeVisible)}
                    />
                  </div>
                </div>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 12,
                    display: 'block',
                    marginTop: 8,
                    color: canEditPasscodePermission ? '#023047' : '#d46b08'
                  }}
                >
                  {canEditPasscodePermission 
                    ? "Gunakan passcode ini untuk login ke sistem (dapat diedit)"
                    : "Gunakan passcode ini untuk login ke sistem (hanya dapat dilihat)"
                  }
                </Text>
              </Card>

              {/* Join Date */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16
              }}>
                <CalendarOutlined style={{ color: '#219ebc' }} />
                <Text type="secondary">
                  Bergabung {formatDate(profile.createdAt)}
                </Text>
              </div>

              {/* Edit & Logout Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditModalOpen(true)}
                  size="large"
                  style={{ width: '100%' }}
                >
                  Edit Profil
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  size="large"
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  Keluar (Logout)
                </Button>
              </div>
            </Card>
          </Col>

          {/* Information Cards */}
          <Col xs={24} lg={16}>
            <ProfileInfoCard profile={profile} roleInfo={roleInfo} />
          </Col>
        </Row>

        {/* Edit Modal */}
        <ProfileEditModal
          editModalOpen={editModalOpen}
          setEditModalOpen={setEditModalOpen}
          form={form}
          handleUpdateProfile={handleUpdateProfile}
          roleInfoColor={roleInfo.color}
        />
      </div>
  );
};

export default UnifiedProfile;