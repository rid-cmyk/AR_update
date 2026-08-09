import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { QuestionCircleOutlined, PhoneOutlined, WhatsAppOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AdminSettings {
  whatsappNumber: string;
  whatsappMessageHelp: string;
}

interface AdminHelpModalProps {
  visible: boolean;
  onCancel: () => void;
  adminSettings: AdminSettings | null;
}

export function AdminHelpModal({ visible, onCancel, adminSettings }: AdminHelpModalProps) {
  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#219ebc' }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} />
          Butuh Bantuan Segera?
        </div>
      }
      open={visible}
      onCancel={onCancel}
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
              background: '#f0f9ff',
              padding: 20,
              borderRadius: 12,
              border: '2px solid #219ebc',
              marginBottom: 16
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 12
              }}>
                <PhoneOutlined style={{ fontSize: 24, color: '#219ebc' }} />
                <div>
                  <Text style={{ display: 'block', fontSize: 13, color: '#8c8c8c' }}>
                    Nomor Admin
                  </Text>
                  <Text strong style={{ fontSize: 18, color: '#219ebc' }}>
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
                  background: '#25D366',
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
  );
}
