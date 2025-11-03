"use client";

import { notification } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export class CrudNotifications {
  // Success notifications
  static userCreated(userName: string, passcode: string) {
    notification.success({
      message: '🎉 User Berhasil Ditambahkan!',
      description: (
        <div>
          <p><strong>{userName}</strong> telah berhasil ditambahkan ke sistem.</p>
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#f6ffed', 
            borderRadius: '4px',
            border: '1px solid #b7eb8f'
          }}>
            <strong>📋 Info Login:</strong><br />
            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              Passcode: <strong>{passcode}</strong>
            </span>
          </div>
        </div>
      ),
      duration: 8,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static userUpdated(userName: string) {
    notification.success({
      message: '✅ User Berhasil Diperbarui!',
      description: `Informasi user "${userName}" telah berhasil diperbarui dalam sistem.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static userDeleted(userName: string) {
    notification.success({
      message: '🗑️ User Berhasil Dihapus!',
      description: `User "${userName}" dan semua data terkait telah berhasil dihapus dari sistem.`,
      duration: 6,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static roleCreated(roleName: string) {
    notification.success({
      message: '🎭 Role Berhasil Ditambahkan!',
      description: `Role "${roleName}" telah berhasil ditambahkan ke sistem dengan hak akses dasar. Data tersinkronisasi dengan user management.`,
      duration: 6,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static roleUpdated(roleName: string) {
    notification.success({
      message: '✏️ Role Berhasil Diperbarui!',
      description: `Role "${roleName}" telah berhasil diperbarui. Perubahan akan tersinkronisasi dengan semua user.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static roleDeleted(roleName: string) {
    notification.success({
      message: '🗑️ Role Berhasil Dihapus!',
      description: `Role "${roleName}" telah berhasil dihapus dari sistem.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  // Error notifications
  static userCreateError(error: string) {
    notification.error({
      message: '❌ Gagal Menambahkan User',
      description: error,
      duration: 6,
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  static userUpdateError(error: string) {
    notification.error({
      message: '❌ Gagal Memperbarui User',
      description: error,
      duration: 6,
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  static userDeleteError(error: string) {
    notification.error({
      message: '❌ Gagal Menghapus User',
      description: error,
      duration: 6,
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  static roleError(action: string, error: string) {
    notification.error({
      message: `❌ Gagal ${action} Role`,
      description: error,
      duration: 6,
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  // Warning notifications
  static duplicatePasscode() {
    notification.warning({
      message: '⚠️ Passcode Sudah Digunakan',
      description: 'Passcode yang Anda masukkan sudah digunakan oleh user lain. Silakan gunakan passcode yang berbeda.',
      duration: 6,
      placement: 'topRight',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    });
  }

  static cannotDeleteSuperAdmin() {
    notification.warning({
      message: '🛡️ Tidak Dapat Menghapus Super Admin',
      description: 'User dengan role super admin tidak dapat dihapus untuk menjaga keamanan sistem.',
      duration: 6,
      placement: 'topRight',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    });
  }

  static cannotDeleteRoleWithUsers(roleName: string) {
    notification.warning({
      message: '⚠️ Tidak Dapat Menghapus Role',
      description: `Role "${roleName}" masih memiliki user. Pindahkan user ke role lain terlebih dahulu.`,
      duration: 6,
      placement: 'topRight',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    });
  }

  // Info notifications
  static dataLoading() {
    notification.info({
      message: '📊 Memuat Data...',
      description: 'Sedang mengambil data dari server. Mohon tunggu sebentar.',
      duration: 3,
      placement: 'topRight',
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    });
  }

  static dataRefreshed() {
    notification.info({
      message: '🔄 Data Diperbarui',
      description: 'Data telah berhasil diperbarui dari server.',
      duration: 3,
      placement: 'topRight',
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    });
  }

  // Batch operations
  static batchSuccess(action: string, count: number) {
    notification.success({
      message: `✅ ${action} Berhasil`,
      description: `${count} item telah berhasil diproses.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  // Assignment notifications
  static santriAssigned(parentName: string, santriCount: number) {
    notification.success({
      message: '👨‍👩‍👧‍👦 Santri Berhasil Di-assign',
      description: `${santriCount} santri telah berhasil di-assign ke orang tua "${parentName}".`,
      duration: 6,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static santriUnassigned(parentName: string, santriCount: number) {
    notification.info({
      message: '👥 Assignment Santri Diperbarui',
      description: `Assignment santri untuk orang tua "${parentName}" telah diperbarui. ${santriCount} santri saat ini di-assign.`,
      duration: 6,
      placement: 'topRight',
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    });
  }
}  
// Passcode specific notifications
  static passcodeUpdated(userName: string) {
    notification.success({
      message: '🔐 Passcode Berhasil Diperbarui!',
      description: `Passcode untuk "${userName}" telah berhasil diperbarui. Data tersinkronisasi dengan profil user.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  static passcodeAccessDenied() {
    notification.error({
      message: '🚫 Akses Ditolak!',
      description: 'Hanya Super Admin dan Admin yang dapat mengedit passcode pengguna.',
      duration: 6,
      placement: 'topRight',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  static permissionsUpdated(roleName: string) {
    notification.success({
      message: '🔑 Hak Akses Berhasil Diperbarui!',
      description: `Hak akses untuk role "${roleName}" telah berhasil diperbarui dan tersinkronisasi.`,
      duration: 5,
      placement: 'topRight',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }