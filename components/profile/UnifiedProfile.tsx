'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Typography,
  Button,
  Form,
  message,
  Spin,
} from "antd";
import { ProfileEditModal } from './ProfileEditModal';
import { ProfileInfoCard } from './ProfileInfoCard';
import { ProfileCard } from './ProfileCard';
import { getRoleInfo } from './roleInfo';
import { UserProfile } from './profileTypes';

const { Title } = Typography;

interface UnifiedProfileProps {
  userRole: string;
}

export const UnifiedProfile: React.FC<UnifiedProfileProps> = ({ userRole }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [form] = Form.useForm();

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

  const roleInfo = getRoleInfo(userRole);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <ProfileCard
            profile={profile}
            roleInfo={roleInfo}
            passcodeVisible={passcodeVisible}
            onTogglePasscode={() => setPasscodeVisible(!passcodeVisible)}
            onEdit={() => setEditModalOpen(true)}
            onLogout={handleLogout}
          />
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
