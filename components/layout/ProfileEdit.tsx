import React from "react";
import { Avatar, Typography, Button, Form, Input } from "antd";
import type { FormInstance } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  CameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { UserProfile } from "./profileContentTypes";
import styles from "./ProfileContent.module.css";

const { Text } = Typography;

interface ProfileEditProps {
  form: FormInstance;
  profile: UserProfile;
  saving: boolean;
  onPickAvatarFile: () => void;
  onFinish: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function ProfileEdit({
  form,
  profile,
  saving,
  onPickAvatarFile,
  onFinish,
  onCancel,
}: ProfileEditProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className={styles.editAvatarWrapper}>
          <Avatar
            size={140}
            src={profile.foto}
            icon={!profile.foto ? <UserOutlined /> : undefined}
            className={styles.editAvatarImage}
          />
          <div
            role="button"
            aria-label="Ubah foto profil"
            onClick={onPickAvatarFile}
            className={styles.avatarUploadBtn}
          >
            <UploadOutlined style={{ color: "white", fontSize: 18 }} />
          </div>
        </div>
        <div>
          <Text className={styles.uploadHint}>
            <CameraOutlined /> Klik ikon untuk mengubah foto profil
          </Text>
        </div>
      </div>

      <Form.Item
        name="namaLengkap"
        label="Nama Lengkap"
        rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
      >
        <Input size="large" placeholder="Masukkan nama lengkap Anda" />
      </Form.Item>

      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: "Username wajib diisi" }]}
      >
        <Input size="large" placeholder="Masukkan username Anda" />
      </Form.Item>

      <Form.Item name="noTlp" label="No. Telepon">
        <Input size="large" placeholder="Masukkan nomor telepon (opsional)" />
      </Form.Item>

      <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          size="large"
          loading={saving}
          className={styles.btnSave}
        >
          Simpan Perubahan
        </Button>
        <Button
          onClick={onCancel}
          icon={<CloseOutlined />}
          size="large"
          className={styles.btnCancel}
        >
          Batal
        </Button>
      </Form.Item>
    </Form>
  );
}
