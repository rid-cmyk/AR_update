"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  message,
  Space,
  Avatar,
  Upload,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  UploadOutlined,
  BellOutlined,
  LockOutlined,
  DatabaseOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import { RcFile } from "antd/es/upload";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      message.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (file: RcFile) => {
    // Handle logo upload logic here
    message.success('Logo berhasil diupload');
    return false;
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <SettingOutlined style={{ marginRight: 12, color: '#667eea' }} />
              Pengaturan Sistem
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Konfigurasi dan pengaturan aplikasi Ar-Hapalan
            </div>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            appName: 'Ar-Hapalan',
            notifications: true,
            autoBackup: true,
            language: 'id',
            timezone: 'Asia/Jakarta',
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* General Settings */}
              <Card
                title={
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    ⚙️ Pengaturan Umum
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
                }}
                bodyStyle={{
                  padding: '24px',
                  background: 'transparent'
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Nama Aplikasi</span>}
                      name="appName"
                      rules={[{ required: true, message: 'Nama aplikasi harus diisi!' }]}
                    >
                      <Input
                        placeholder="Masukkan nama aplikasi"
                        size="large"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e8e8e8',
                          transition: 'all 0.3s ease',
                          fontSize: '14px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e8e8e8';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Bahasa</span>}
                      name="language"
                    >
                      <Select
                        size="large"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e8e8e8'
                        }}
                      >
                        <Option value="id">Bahasa Indonesia</Option>
                        <Option value="en">English</Option>
                        <Option value="ar">العربية</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Zona Waktu</span>}
                  name="timezone"
                >
                  <Select
                    size="large"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e8e8e8'
                    }}
                  >
                    <Option value="Asia/Jakarta">Asia/Jakarta (WIB)</Option>
                    <Option value="Asia/Makassar">Asia/Makassar (WITA)</Option>
                    <Option value="Asia/Jayapura">Asia/Jayapura (WIT)</Option>
                  </Select>
                </Form.Item>

                <Divider style={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />

                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#333', fontSize: '14px' }}>Logo Aplikasi</Text>
                </div>
                <Space>
                  <Avatar size={64} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    📖
                  </Avatar>
                  <Upload
                    beforeUpload={handleLogoUpload}
                    showUploadList={false}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e8e8e8',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e8e8e8';
                        e.currentTarget.style.color = '#666';
                      }}
                    >
                      Upload Logo Baru
                    </Button>
                  </Upload>
                </Space>
              </Card>

              {/* Notification Settings */}
              <Card
                title={
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🔔 Pengaturan Notifikasi
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  marginTop: '24px'
                }}
                bodyStyle={{
                  padding: '24px',
                  background: 'transparent'
                }}
              >
                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Aktifkan Notifikasi Email</span>}
                  name="notifications"
                  valuePropName="checked"
                >
                  <Switch
                    style={{
                      background: '#e8e8e8'
                    }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Notifikasi Otomatis Adzan</span>}
                  name="autoAdzan"
                  valuePropName="checked"
                >
                  <Switch
                    style={{
                      background: '#e8e8e8'
                    }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Form.Item>
              </Card>

              {/* Security Settings */}
              <Card
                title={
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🔒 Pengaturan Keamanan
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  marginTop: '24px'
                }}
                bodyStyle={{
                  padding: '24px',
                  background: 'transparent'
                }}
              >
                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Two-Factor Authentication</span>}
                  name="twoFactor"
                  valuePropName="checked"
                >
                  <Switch
                    style={{
                      background: '#e8e8e8'
                    }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Session Timeout (menit)</span>}
                  name="sessionTimeout"
                >
                  <Select
                    size="large"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e8e8e8'
                    }}
                  >
                    <Option value="15">15 menit</Option>
                    <Option value="30">30 menit</Option>
                    <Option value="60">1 jam</Option>
                    <Option value="240">4 jam</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* System Info */}
              <Card
                title={
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    💻 Info Sistem
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
                }}
                bodyStyle={{
                  padding: '24px',
                  background: 'transparent'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#333' }}>Versi Aplikasi:</Text>
                  <div style={{ color: '#666', marginTop: '4px' }}>v1.0.0</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#333' }}>Database:</Text>
                  <div style={{ color: '#52c41a', marginTop: '4px' }}>✅ Terhubung</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#333' }}>Terakhir Backup:</Text>
                  <div style={{ color: '#666', marginTop: '4px' }}>2024-01-15 02:00</div>
                </div>

                <div>
                  <Text strong style={{ color: '#333' }}>Storage:</Text>
                  <div style={{ color: '#1890ff', marginTop: '4px' }}>2.4 GB / 10 GB</div>
                </div>
              </Card>

              {/* Backup Settings */}
              <Card
                title={
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    💾 Backup Database
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  marginTop: '24px'
                }}
                bodyStyle={{
                  padding: '24px',
                  background: 'transparent'
                }}
              >
                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Backup Otomatis</span>}
                  name="autoBackup"
                  valuePropName="checked"
                >
                  <Switch
                    style={{
                      background: '#e8e8e8'
                    }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Frekuensi Backup</span>}
                  name="backupFrequency"
                >
                  <Select
                    size="large"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e8e8e8'
                    }}
                  >
                    <Option value="daily">Harian</Option>
                    <Option value="weekly">Mingguan</Option>
                    <Option value="monthly">Bulanan</Option>
                  </Select>
                </Form.Item>

                <Button
                  type="primary"
                  icon={<DatabaseOutlined />}
                  block
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '16px'
                  }}
                >
                  Backup Sekarang
                </Button>
              </Card>
            </Col>
          </Row>

          {/* Save Button */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              Simpan Pengaturan
            </Button>
          </div>
        </Form>
      </div>
    </LayoutApp>
  );
}