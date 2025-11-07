"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Divider, Typography, Space } from "antd";
import { WhatsAppOutlined, SaveOutlined } from "@ant-design/icons";
import ReadOnlyPlaceholderTextArea from "./ReadOnlyPlaceholderTextArea";

const { TextArea } = Input;
const { Text } = Typography;

interface AdminSettings {
  id: number;
  whatsappNumber: string;
  whatsappMessageHelp: string;
  whatsappMessageRegistered: string;
  whatsappMessageUnregistered: string;
}

interface AdminSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminSettingsModal({ visible, onClose, onSuccess }: AdminSettingsModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Default text dengan placeholder
  const DEFAULT_HELP_TEXT = `Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : 

terimakasih Atas bantuannya`;

  const DEFAULT_REGISTERED_TEXT = `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda di Aplikasi AR-Hafalan. Jaga kerahasiaan passcode Anda dan jangan berikan kepada siapapun.

Terima kasih atas partisipasinya dalam menggunakan Aplikasi AR-Hafalan.

Wassalamualaikum Warahmatullahi Wabarakatuh.`;

  const DEFAULT_UNREGISTERED_TEXT = `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu melalui aplikasi atau hubungi admin untuk informasi lebih lanjut.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.`;

  useEffect(() => {
    if (visible) {
      fetchSettings();
    }
  }, [visible]);

  // Format nomor WhatsApp otomatis ke +62
  const formatWhatsAppNumber = (value: string) => {
    if (!value) return '';
    
    // Hapus semua karakter non-digit
    let cleaned = value.replace(/\D/g, '');
    
    // Jika dimulai dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    // Jika tidak dimulai dengan 62, tambahkan 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    // Tambahkan + di depan
    return '+' + cleaned;
  };

  const handleWhatsAppNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsAppNumber(e.target.value);
    form.setFieldsValue({ whatsappNumber: formatted });
  };

  const fetchSettings = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch('/api/admin-settings');
      if (response.ok) {
        const data: AdminSettings = await response.json();
        
        // Merge dengan default value jika ada field yang kosong
        const mergedData = {
          whatsappNumber: data.whatsappNumber || '+6281213923253',
          whatsappMessageHelp: data.whatsappMessageHelp || DEFAULT_HELP_TEXT,
          whatsappMessageRegistered: data.whatsappMessageRegistered || DEFAULT_REGISTERED_TEXT,
          whatsappMessageUnregistered: data.whatsappMessageUnregistered || DEFAULT_UNREGISTERED_TEXT
        };
        
        form.setFieldsValue(mergedData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Gagal memuat pengaturan');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Gunakan default value jika field kosong
      const dataToSave = {
        whatsappNumber: values.whatsappNumber || '+6281213923253',
        whatsappMessageHelp: values.whatsappMessageHelp || DEFAULT_HELP_TEXT,
        whatsappMessageRegistered: values.whatsappMessageRegistered || DEFAULT_REGISTERED_TEXT,
        whatsappMessageUnregistered: values.whatsappMessageUnregistered || DEFAULT_UNREGISTERED_TEXT
      };
      
      console.log('Data yang akan disimpan:', dataToSave);
      
      // TEMPORARY: Gunakan endpoint tanpa auth
      // TODO: Ganti ke /api/admin-settings setelah auth fixed
      const response = await fetch('/api/admin-settings/update-no-auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        message.success('Pengaturan berhasil disimpan');
        onSuccess();
        onClose();
      } else {
        let errorMessage = 'Gagal menyimpan pengaturan';
        try {
          const error = await response.json();
          console.error('Error response:', error);
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
          <span>Pengaturan WhatsApp Super Admin</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div style={{
        padding: '12px 16px',
        background: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: 6,
        marginBottom: 16
      }}>
        <Text style={{ fontSize: 13, color: '#0050b3' }}>
          🔐 <strong>Khusus Super Admin:</strong> Pengaturan ini akan mempengaruhi nomor dan template pesan WhatsApp yang ditampilkan di halaman Forgot Passcode untuk semua user.
        </Text>
      </div>

      <div style={{
        padding: '12px 16px',
        background: '#fff7e6',
        border: '1px solid #ffd591',
        borderRadius: 6,
        marginBottom: 16
      }}>
        <Text style={{ fontSize: 13, color: '#d46b08' }}>
          ℹ️ <strong>Kenapa Placeholder Tidak Bisa Diedit?</strong>
          <br />
          Placeholder seperti <Text code>{'{tanggal}'}</Text>, <Text code>{'{nama}'}</Text>, <Text code>{'{passcode}'}</Text>, dan <Text code>{'{nomor}'}</Text> adalah variabel yang akan diganti otomatis dengan data user saat pesan dikirim.
          <br />
          <strong>Fungsi:</strong> Personalisasi pesan untuk setiap user dengan data mereka (nama, passcode, nomor telepon, dll).
          <br />
          <strong>Contoh:</strong> <Text code>{'{nama}'}</Text> akan diganti dengan "Ahmad Fauzi" saat kirim pesan ke user tersebut.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={fetchLoading}
      >
        <Divider orientation="left">Nomor WhatsApp</Divider>
        
        <Form.Item
          name="whatsappNumber"
          label="Nomor WhatsApp Super Admin"
          rules={[
            { required: true, message: 'Nomor WhatsApp harus diisi' },
            { 
              pattern: /^\+62[0-9]{9,13}$/, 
              message: 'Format nomor tidak valid. Harus dimulai dengan +62' 
            }
          ]}
          extra="Otomatis format ke +62. Contoh: ketik 081234567890 → +6281234567890"
        >
          <Input
            prefix={<WhatsAppOutlined style={{ color: '#25D366' }} />}
            placeholder="081234567890"
            size="large"
            onChange={handleWhatsAppNumberChange}
            maxLength={16}
          />
        </Form.Item>

        <Divider orientation="left">Template Pesan</Divider>

        <Form.Item
          name="whatsappMessageHelp"
          label="Pesan Bantuan (Tombol 'Hubungi Admin' di halaman Forgot Passcode)"
          rules={[{ required: true, message: 'Pesan bantuan harus diisi' }]}
          initialValue={DEFAULT_HELP_TEXT}
        >
          <TextArea
            rows={4}
            placeholder="Assalamualaikum App Ar-Hafalan..."
          />
        </Form.Item>

        <Form.Item
          name="whatsappMessageRegistered"
          label="Pesan untuk User Terdaftar"
          rules={[
            { required: true, message: 'Template pesan harus diisi' }
          ]}
          initialValue={DEFAULT_REGISTERED_TEXT}
        >
          <ReadOnlyPlaceholderTextArea
            rows={12}
            readOnlyPlaceholders={['{tanggal}', '{nama}', '{passcode}']}
            defaultText={DEFAULT_REGISTERED_TEXT}
            placeholder="Ketik pesan Anda..."
          />
        </Form.Item>

        <Form.Item
          name="whatsappMessageUnregistered"
          label="Pesan untuk User Tidak Terdaftar"
          rules={[
            { required: true, message: 'Template pesan harus diisi' }
          ]}
          initialValue={DEFAULT_UNREGISTERED_TEXT}
        >
          <ReadOnlyPlaceholderTextArea
            rows={10}
            readOnlyPlaceholders={['{nomor}']}
            defaultText={DEFAULT_UNREGISTERED_TEXT}
            placeholder="Ketik pesan Anda..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Simpan Pengaturan
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
