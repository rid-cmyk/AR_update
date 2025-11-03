'use client';

import React, { useState, useEffect } from 'react';
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
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import LayoutApp from '@/components/layout/LayoutApp';

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
  // Role-specific data
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

// Permission helper functions
const canEditSelfPasscode = (userRole: string): boolean => {
  return ['super_admin', 'admin'].includes(userRole.toLowerCase());
};

const canEditProfile = (userRole: string): boolean => {
  // All roles can edit their basic profile info
  return true;
};

const canEditPhoto = (userRole: string): boolean => {
  // Santri tidak bisa edit foto sendiri, hanya Super Admin yang bisa edit foto santri
  return userRole.toLowerCase() !== 'santri';
};

const getPermissionMessage = (userRole: string): string => {
  if (userRole.toLowerCase() === 'super_admin') {
    return "Sebagai Super Admin, Anda dapat mengedit semua data profil termasuk passcode. Anda juga dapat mengelola passcode user lain melalui user management.";
  } else if (userRole.toLowerCase() === 'admin') {
    return "Sebagai Admin, Anda dapat mengedit profil dan passcode sendiri. Untuk mengelola user lain, hubungi Super Admin.";
  } else if (userRole.toLowerCase() === 'santri') {
    return "Anda dapat mengedit data profil dasar. Foto hanya dapat diubah oleh Super Admin melalui user management. Passcode hanya dapat diubah oleh Super Admin.";
  } else {
    return "Anda hanya dapat melihat dan mengedit data profil dasar. Passcode hanya dapat diubah oleh Super Admin melalui user management.";
  }
};

export const UnifiedProfile: React.FC<UnifiedProfileProps> = ({ userRole }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Permission states
  const canEditPasscodePermission = canEditSelfPasscode(userRole);
  const canEditProfilePermission = canEditProfile(userRole);
  const canEditPhotoPermission = canEditPhoto(userRole);
  const permissionMessage = getPermissionMessage(userRole);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setProfile(data.user);
        // Set form values including username as passcode
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
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const handleUpdateProfile = async (values: any) => {
    try {
      // Prepare payload with username as passcode
      const payload = {
        ...values,
        // Use username as passcode for login system compatibility
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

  // Get role-specific information
  const getRoleInfo = () => {
    const roleConfig = {
      super_admin: {
        title: 'Super Administrator',
        description: 'Akses penuh ke seluruh sistem AR-Hafalan',
        color: '#722ed1',
        icon: <IdcardOutlined />,
        permissions: ['Kelola semua user', 'Backup database', 'System monitoring', 'Reset password']
      },
      admin: {
        title: 'Administrator',
        description: 'Mengelola sistem pesantren dan data santri',
        color: '#1890ff',
        icon: <TeamOutlined />,
        permissions: ['Kelola halaqah', 'Template ujian', 'Generate raport', 'Verifikasi ujian']
      },
      guru: {
        title: 'Guru/Ustadz',
        description: 'Mengajar dan menilai hafalan santri',
        color: '#52c41a',
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
        color: '#fa8c16',
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

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LayoutApp>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px' 
        }}>
          <Spin size="large" />
        </div>
      </LayoutApp>
    );
  }

  if (!profile) {
    return (
      <LayoutApp>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Title level={3}>Profil tidak ditemukan</Title>
          <Button type="primary" onClick={fetchProfile}>
            Muat Ulang
          </Button>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8, color: '#1f2937' }}>
            👤 Profil Pengguna
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Kelola informasi akun dan pengaturan profil Anda
          </Text>
        </div>

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
                  count={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
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
                    color: '#fa8c16'
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
                  background: canEditPasscodePermission 
                    ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' 
                    : 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)', 
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
                      color: canEditPasscodePermission ? '#52c41a' : '#fa8c16' 
                    }} />
                    <Text strong>Passcode:</Text>
                    {!canEditPasscodePermission && (
                      <Tag color="orange" size="small">View Only</Tag>
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
                    color: canEditPasscodePermission ? '#389e0d' : '#d46b08'
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
                background: 'rgba(24, 144, 255, 0.1)', 
                borderRadius: 8,
                marginBottom: 16
              }}>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">
                  Bergabung {formatDate(profile.createdAt)}
                </Text>
              </div>

              {/* Edit Button */}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
                size="large"
                style={{ width: '100%' }}
              >
                Edit Profil
              </Button>
            </Card>
          </Col>

          {/* Information Cards */}
          <Col xs={24} lg={16}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 24 
            }}>
              {/* Personal Information */}
              <Card 
                title={
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 
                  }}>
                    <InfoCircleOutlined style={{ color: roleInfo.color }} />
                    <span>Informasi Personal</span>
                  </div>
                }
                style={{ borderRadius: '12px' }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 1 
                        }}
                      >
                        Nama Lengkap
                      </Text>
                      <div style={{ 
                        fontSize: 16,
                        fontWeight: 500,
                        color: '#1f2937',
                        marginTop: 4 
                      }}>
                        {profile.namaLengkap}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: 16 }}>
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 1 
                        }}
                      >
                        Username
                      </Text>
                      <div style={{ 
                        fontSize: 16,
                        fontWeight: 500,
                        color: '#1f2937',
                        marginTop: 4 
                      }}>
                        {profile.username}
                      </div>
                    </div>
                  </Col>
                  {profile.email && (
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: 12,
                            textTransform: 'uppercase',
                            letterSpacing: 1 
                          }}
                        >
                          Email
                        </Text>
                        <div style={{ 
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#1f2937',
                          marginTop: 4 
                        }}>
                          {profile.email}
                        </div>
                      </div>
                    </Col>
                  )}
                  {profile.noTlp && (
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: 12,
                            textTransform: 'uppercase',
                            letterSpacing: 1 
                          }}
                        >
                          <PhoneOutlined style={{ marginRight: 4 }} />
                          No. Telepon
                        </Text>
                        <div style={{ 
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#1f2937',
                          marginTop: 4 
                        }}>
                          {profile.noTlp}
                        </div>
                      </div>
                    </Col>
                  )}
                  {profile.alamat && (
                    <Col xs={24}>
                      <div style={{ marginBottom: 16 }}>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: 12,
                            textTransform: 'uppercase',
                            letterSpacing: 1 
                          }}
                        >
                          Alamat
                        </Text>
                        <div style={{ 
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#1f2937',
                          marginTop: 4 
                        }}>
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
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 
                  }}>
                    <CheckCircleOutlined style={{ color: roleInfo.color }} />
                    <span>Hak Akses & Fitur</span>
                  </div>
                }
                style={{ borderRadius: '12px' }}
              >
                <Row gutter={[12, 12]}>
                  {roleInfo.permissions.map((permission, index) => (
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
                        <CheckCircleOutlined style={{ 
                          color: roleInfo.color,
                          fontSize: 16 
                        }} />
                        <Text style={{ 
                          fontSize: 14,
                          fontWeight: 500 
                        }}>
                          {permission}
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Edit Modal */}
        <Modal
          title={
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8 
            }}>
              <EditOutlined />
              <span>Edit Profil</span>
            </div>
          }
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="namaLengkap"
                  label="Nama Lengkap"
                  rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
                >
                  <Input placeholder="Masukkan nama lengkap" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: 'email', message: 'Format email tidak valid!' }]}
                >
                  <Input placeholder="Masukkan email" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="noTlp"
                  label="No. Telepon"
                >
                  <Input placeholder="Masukkan nomor telepon" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Passcode (Username untuk Login)"
                  rules={[{ required: true, message: 'Passcode wajib diisi!' }]}
                >
                  <Input 
                    placeholder="Masukkan passcode baru"
                    prefix={<KeyOutlined style={{ color: roleInfo.color }} />}
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="alamat"
              label="Alamat"
            >
              <Input.TextArea rows={3} placeholder="Masukkan alamat lengkap" />
            </Form.Item>

            <div style={{ 
              padding: 16,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 14, color: '#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                <strong>Passcode Info:</strong> Passcode yang Anda ubah akan menjadi username dan password baru untuk login ke sistem.
              </Text>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Button 
                onClick={() => setEditModalOpen(false)} 
                style={{ marginRight: 8 }}
              >
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                Simpan Perubahan
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
};

export default UnifiedProfile;