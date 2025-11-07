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
  Result
} from "antd";
import {
  SendOutlined
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

          {/* WhatsApp Admin Contact */}
          {adminSettings && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: 24,
              padding: 16,
              background: '#f0f9ff',
              border: '1px solid #91d5ff',
              borderRadius: 8
            }}>
              <Text style={{ color: '#666', display: 'block', marginBottom: 8 }}>
                Butuh bantuan segera?
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
                  gap: 8
                }}
              >
                <span style={{ fontSize: 20 }}>📱</span>
                Hubungi Admin: {adminSettings.whatsappNumber}
              </a>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
}