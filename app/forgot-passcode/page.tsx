"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Form, 
  Input,
  Button, 
  message, 
  Typography, 
  Space,
  Result,
  Modal
} from "antd";
import {
  SendOutlined,
  QuestionCircleOutlined,
  WhatsAppOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import PhoneNumberInput from "@/components/common/PhoneNumberInput";
import { useLockoutStatus } from "@/hooks/useLockoutStatus";
import "./forgot-passcode.css";

const { Text } = Typography;

interface AdminSettings {
  whatsappNumber: string;
  whatsappMessageHelp: string;
}

interface ForgotPasscodeResponse {
  success: boolean;
  message: string;
  isRegistered: boolean;
  user?: {
    namaLengkap: string;
    username: string;
  };
}

export default function ForgotPasscodePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<ForgotPasscodeResponse | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Use lockout status hook for cross-page synchronization
  const { 
    isLocked, 
    attempts: attemptCount, 
    formattedTime
  } = useLockoutStatus();

  // Fetch admin settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin-settings');
        if (res.ok) {
          const data = await res.json();
          setAdminSettings(data);
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (values: { phoneNumber: string; message?: string }) => {
    try {
      setLoading(true);
      
      const res = await fetch('/api/forgot-passcode/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        setSubmitted(true);
        message.success('Permintaan berhasil dikirim!');
      } else {
        message.error(data.error || 'Gagal mengirim permintaan');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      message.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setResponse(null);
    form.resetFields();
  };

  if (submitted && response) {
    return (
      <div className="forgot-passcode-container">
        {/* 🌍 Background */}
        <div className="forgot-planet" />
        <div className="forgot-stars" />
        <div className="forgot-stars2" />

        {/* ✨ Islamic Header */}
        <div className="forgot-header">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>

        {/* Floating Help Button */}
        {adminSettings && (
          <button
            onClick={() => setHelpModalVisible(true)}
            style={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
              transition: 'all 0.3s ease',
              zIndex: 1000
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.4)';
            }}
          >
            <QuestionCircleOutlined />
          </button>
        )}

        <Card className="forgot-card">
          <Result
            status={response.isRegistered ? "success" : "warning"}
            title={response.isRegistered ? "Permintaan Terkirim" : "Nomor Tidak Terdaftar"}
            subTitle={response.message}
            extra={[
              <Button type="primary" key="back" onClick={resetForm}>
                Kirim Permintaan Lain
              </Button>,
              <Button key="home" onClick={() => window.location.href = '/login'}>
                Kembali ke Login
              </Button>
            ]}
          >
            {response.isRegistered && response.user && (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 6,
                padding: 16,
                marginTop: 16
              }}>
                <Space direction="vertical" size="small">
                  <Text strong>Akun Ditemukan:</Text>
                  <Text>Nama: {response.user.namaLengkap}</Text>
                  <Text>Username: @{response.user.username}</Text>
                </Space>
              </div>
            )}

            {/* WhatsApp Admin Contact - Tampil di Result Page */}
            {adminSettings && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: 24,
                padding: 16,
                background: response.isRegistered ? '#f0f9ff' : '#fff7e6',
                border: response.isRegistered ? '1px solid #91d5ff' : '1px solid #ffd591',
                borderRadius: 8
              }}>
                <Text style={{ color: '#666', display: 'block', marginBottom: 12, fontSize: 14 }}>
                  {response.isRegistered 
                    ? '💬 Admin akan segera menghubungi Anda via WhatsApp' 
                    : '⚠️ Nomor Anda belum terdaftar. Butuh bantuan?'}
                </Text>
                <a
                  href={`https://wa.me/${adminSettings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(adminSettings.whatsappMessageHelp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#25D366',
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: '#fff',
                    borderRadius: 6,
                    border: '1px solid #25D366',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#25D366';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#25D366';
                  }}
                >
                  <span style={{ fontSize: 20 }}>📱</span>
                  Hubungi Admin: {adminSettings.whatsappNumber}
                </a>
                <Text style={{ 
                  color: '#999', 
                  display: 'block', 
                  marginTop: 12, 
                  fontSize: 12 
                }}>
                  Klik untuk chat langsung via WhatsApp
                </Text>
              </div>
            )}
          </Result>
        </Card>

        {/* Help Modal */}
        <Modal
          title={
            <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
              <QuestionCircleOutlined style={{ marginRight: 8 }} />
              Butuh Bantuan Segera?
            </div>
          }
          open={helpModalVisible}
          onCancel={() => setHelpModalVisible(false)}
          footer={null}
          centered
          width={480}
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: 24,
              padding: 16,
              background: '#f0f9ff',
              borderRadius: 8
            }}>
              <Text style={{ fontSize: 15, color: '#666', display: 'block', marginBottom: 8 }}>
                Jika Anda mengalami kesulitan atau membutuhkan bantuan segera, 
                silakan hubungi admin kami melalui WhatsApp
              </Text>
            </div>

            {adminSettings && (
              <>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                  padding: 20,
                  borderRadius: 12,
                  border: '2px solid #1890ff',
                  marginBottom: 16
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    marginBottom: 12
                  }}>
                    <PhoneOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div>
                      <Text style={{ display: 'block', fontSize: 13, color: '#8c8c8c' }}>
                        Nomor Admin
                      </Text>
                      <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        {adminSettings.whatsappNumber}
                      </Text>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${adminSettings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(adminSettings.whatsappMessageHelp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                    style={{
                      height: 56,
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                    }}
                  >
                    Chat via WhatsApp
                  </Button>
                </a>

                <Text style={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  marginTop: 16, 
                  fontSize: 13, 
                  color: '#8c8c8c' 
                }}>
                  💬 Klik tombol di atas untuk langsung chat dengan admin
                </Text>

                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: '#fffbe6',
                  border: '1px solid #ffe58f',
                  borderRadius: 8
                }}>
                  <Text style={{ fontSize: 13, color: '#666' }}>
                    <strong>💡 Tips:</strong> Admin kami siap membantu Anda dengan:
                  </Text>
                  <ul style={{ 
                    marginTop: 8, 
                    marginBottom: 0, 
                    paddingLeft: 20,
                    fontSize: 13,
                    color: '#666'
                  }}>
                    <li>Reset passcode yang lupa</li>
                    <li>Verifikasi akun</li>
                    <li>Masalah login</li>
                    <li>Pertanyaan lainnya</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="forgot-passcode-container">
      {/* 🌍 Background */}
      <div className="forgot-planet" />
      <div className="forgot-stars" />
      <div className="forgot-stars2" />

      {/* ✨ Islamic Header */}
      <div className="forgot-header">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>

      {/* Floating Help Button */}
      {adminSettings && (
        <button
          onClick={() => setHelpModalVisible(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#fff',
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.4)';
          }}
        >
          <QuestionCircleOutlined />
        </button>
      )}

      <Card className="forgot-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#1890ff', marginBottom: 8 }}>
            🔐 Lupa Passcode?
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Masukkan nomor telepon Anda untuk meminta reset passcode. 
            Admin akan memproses permintaan Anda.
          </p>
          
          {/* Show lockout status if user is locked */}
          {isLocked && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              color: '#ff4d4f'
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                🔒 Akun Terkunci
              </div>
              <div style={{ fontSize: 12 }}>
                Anda terkunci dari login karena {attemptCount} kali percobaan gagal.
                <br />
                Waktu tersisa: <strong>{formattedTime}</strong>
              </div>
            </div>
          )}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="phoneNumber"
            label="Nomor Telepon"
            rules={[
              { required: true, message: 'Nomor telepon harus diisi' }
            ]}
          >
            <PhoneNumberInput
              placeholder="Masukkan nomor telepon Anda"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Pesan Tambahan (Opsional)"
          >
            <Input.TextArea
              placeholder="Jelaskan alasan atau informasi tambahan..."
              rows={3}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              block
              style={{ 
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              Kirim Permintaan Reset
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => window.location.href = '/login'}
            >
              Kembali ke Login
            </Button>
          </div>
        </Form>
      </Card>

      {/* Help Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            Butuh Bantuan Segera?
          </div>
        }
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={null}
        centered
        width={480}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 24,
            padding: 16,
            background: '#f0f9ff',
            borderRadius: 8
          }}>
            <Text style={{ fontSize: 15, color: '#666', display: 'block', marginBottom: 8 }}>
              Jika Anda mengalami kesulitan atau membutuhkan bantuan segera, 
              silakan hubungi admin kami melalui WhatsApp
            </Text>
          </div>

          {adminSettings && (
            <>
              <div style={{ 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                padding: 20,
                borderRadius: 12,
                border: '2px solid #1890ff',
                marginBottom: 16
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 12
                }}>
                  <PhoneOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <Text style={{ display: 'block', fontSize: 13, color: '#8c8c8c' }}>
                      Nomor Admin
                    </Text>
                    <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                      {adminSettings.whatsappNumber}
                    </Text>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${adminSettings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(adminSettings.whatsappMessageHelp)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                  style={{
                    height: 56,
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                  }}
                >
                  Chat via WhatsApp
                </Button>
              </a>

              <Text style={{ 
                display: 'block', 
                textAlign: 'center', 
                marginTop: 16, 
                fontSize: 13, 
                color: '#8c8c8c' 
              }}>
                💬 Klik tombol di atas untuk langsung chat dengan admin
              </Text>

              <div style={{
                marginTop: 20,
                padding: 16,
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 8
              }}>
                <Text style={{ fontSize: 13, color: '#666' }}>
                  <strong>💡 Tips:</strong> Admin kami siap membantu Anda dengan:
                </Text>
                <ul style={{ 
                  marginTop: 8, 
                  marginBottom: 0, 
                  paddingLeft: 20,
                  fontSize: 13,
                  color: '#666'
                }}>
                  <li>Reset passcode yang lupa</li>
                  <li>Verifikasi akun</li>
                  <li>Masalah login</li>
                  <li>Pertanyaan lainnya</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}