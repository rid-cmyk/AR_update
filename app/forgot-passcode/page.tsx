"use client";

import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Space, Typography, Divider } from 'antd';
import { PhoneOutlined, WhatsAppOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasscodePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (values: { phoneNumber: string }) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/forgot-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        
        // Send reset password request notification to super-admin
        if (data.user?.username) {
          try {
            await fetch('/api/admin/reset-password-requests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: data.user.username
              }),
            });
          } catch (error) {
            console.error('Error sending reset password request:', error);
          }
        }
      } else {
        setResult({
          found: false,
          message: data.error || 'Terjadi kesalahan'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        found: false,
        message: 'Terjadi kesalahan koneksi'
      });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '500px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          borderRadius: '15px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
            🔐 Lupa Passcode?
          </Title>
          <Text type="secondary">
            Masukkan nomor telepon Anda untuk mendapatkan bantuan reset passcode
          </Text>
        </div>

        {!result && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              label="Nomor Telepon"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Masukkan nomor telepon Anda' },
                { 
                  pattern: /^(\+62|62|0)[0-9]{9,13}$/, 
                  message: 'Format nomor telepon tidak valid' 
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ 
                  height: '45px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cari Data Saya
              </Button>
            </Form.Item>
          </Form>
        )}

        {result && (
          <div>
            {result.found ? (
              <Alert
                message="Data Ditemukan! ✅"
                description={
                  <div>
                    <Paragraph>
                      <strong>Nama:</strong> {result.user?.namaLengkap}<br />
                      <strong>Username:</strong> {result.user?.username}<br />
                      <strong>Role:</strong> {result.user?.role}
                    </Paragraph>
                    <Paragraph>
                      Klik tombol di bawah untuk menghubungi admin melalui WhatsApp dengan pesan otomatis.
                    </Paragraph>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            ) : (
              <Alert
                message="Data Tidak Ditemukan ❌"
                description="Nomor telepon Anda tidak terdaftar dalam sistem. Silakan hubungi admin untuk konfirmasi data."
                type="warning"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}

            <Button
              type="primary"
              icon={<WhatsAppOutlined />}
              onClick={() => openWhatsApp(result.whatsappUrl)}
              block
              size="large"
              style={{
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                height: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              Hubungi Admin via WhatsApp
            </Button>

            <Button
              type="default"
              onClick={() => {
                setResult(null);
                form.resetFields();
              }}
              block
              style={{ borderRadius: '8px' }}
            >
              Coba Nomor Lain
            </Button>
          </div>
        )}

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Link href="/login">
            <Button type="link" icon={<ArrowLeftOutlined />}>
              Kembali ke Login
            </Button>
          </Link>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <Title level={5} style={{ color: '#0369a1', marginBottom: '10px' }}>
            ℹ️ Cara Kerja Sistem:
          </Title>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e' }}>
            <li><strong>Data Ditemukan:</strong> Sistem akan membuat pesan otomatis dengan nama Anda untuk dikirim ke admin</li>
            <li><strong>Data Tidak Ditemukan:</strong> Anda akan diminta menghubungi admin untuk konfirmasi data</li>
            <li><strong>Admin WhatsApp:</strong> {result?.adminPhone || '081213923253'}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}