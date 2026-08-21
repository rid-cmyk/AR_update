"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Space, Typography, Row, Col, Tabs, Form } from "antd";
import {
  PlusOutlined,
  UnlockOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import { useUserManagement, User, Role } from "@/hooks/useUserManagement";

import RoleFormModal from "@/components/super-admin/users/RoleFormModal";
import RoleTable from "@/components/super-admin/users/RoleTable";
import UserTable from "@/components/super-admin/users/UserTable";
import PhotoModal from "@/components/super-admin/users/PhotoModal";
import UserDetailModal from "@/components/super-admin/users/UserDetailModal";
import UserFormModal from "@/components/super-admin/users/UserFormModal";

const { Title, Text } = Typography;

export default function SuperAdminUsersManagement() {
  const {
    allUsers,
    filteredUsers,
    roles,
    santriList,
    usedSantriIds,
    santriAssignments,
    loading,
    rolesLoading,
    filterRole, setFilterRole,
    filterName, setFilterName,
    modals, setModals,
    editingUser, setEditingUser,
    editingRole, setEditingRole,
    selectedUser, setSelectedUser,
    fetchAll,
    checkPasscodeUnique,
    handleRoleSubmit, handleDeleteRole,
    handleUserSubmit, handleDeleteUser,
    handleUpdatePhoto
  } = useUserManagement();

  const [activeTab, setActiveTab] = useState('users');
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <AdminHeaderCard
          title="Manajemen User & Role"
          subtitle="Kelola data pengguna, role, dan hak akses sistem"
          actions={
            <Space>
              {activeTab === 'users' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingUser(null);
                    setModals(prev => ({ ...prev, user: true }));
                  }}
                >
                  Tambah User Baru
                </Button>
              )}
              {activeTab === 'roles' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingRole(null);
                    setModals(prev => ({ ...prev, role: true }));
                  }}
                >
                  Tambah Role Baru
                </Button>
              )}
            </Space>
          }
        />

        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UnlockOutlined style={{ fontSize: 24, color: '#219ebc' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>Super Admin Access</Title>
                  <Text type="secondary">
                    Akses penuh untuk mengelola user, role, dan passcode
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamOutlined style={{ fontSize: 24, color: '#219ebc' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>Akses Eksklusif</Title>
                  <Text type="secondary">
                    Halaman ini hanya dapat diakses oleh Super Admin
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SettingOutlined style={{ fontSize: 24, color: '#ffb703' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>Sinkronisasi Data</Title>
                  <Text type="secondary">
                    Perubahan tersinkronisasi dengan semua modul
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'users',
                label: <span><UserOutlined />Manajemen User</span>,
                children: (
                  <div>
                    {/* Filter section not extracted to a component as per instructions, but can be */}
                    <UserTable
                      users={filteredUsers}
                      loading={loading}
                      santriAssignments={santriAssignments}
                      onViewDetail={(u: User) => { setSelectedUser(u); setModals(prev => ({ ...prev, detail: true })); }}
                      onEdit={(u: User) => { setEditingUser(u); setModals(prev => ({ ...prev, user: true })); }}
                      onManagePhoto={(u: User) => { setSelectedUser(u); setModals(prev => ({ ...prev, photo: true })); }}
                      onDelete={handleDeleteUser}
                    />
                  </div>
                ),
              },
              {
                key: 'roles',
                label: <span><UserSwitchOutlined />Manajemen Role</span>,
                children: (
                  <RoleTable
                    roles={roles}
                    loading={rolesLoading}
                    onEdit={(r: Role) => { setEditingRole(r); roleForm.setFieldsValue(r); setModals(prev => ({ ...prev, role: true })); }}
                    onDelete={handleDeleteRole}
                  />
                ),
              },
            ]}
          />
        </Card>

        <RoleFormModal
          visible={modals.role}
          editingRole={editingRole}
          form={roleForm}
          onClose={() => { setModals(prev => ({ ...prev, role: false })); setEditingRole(null); roleForm.resetFields(); }}
          onSubmit={handleRoleSubmit}
        />

        <UserFormModal
          visible={modals.user}
          editingUser={editingUser}
          form={form}
          roles={roles}
          santriList={santriList}
          usedSantriIds={usedSantriIds}
          checkPasscodeUnique={checkPasscodeUnique}
          onClose={() => { setModals(prev => ({ ...prev, user: false })); setEditingUser(null); form.resetFields(); }}
          onSubmit={handleUserSubmit}
        />

        <UserDetailModal
          visible={modals.detail}
          user={selectedUser}
          santriAssignments={santriAssignments}
          onClose={() => { setModals(prev => ({ ...prev, detail: false })); setSelectedUser(null); }}
        />

        <PhotoModal
          visible={modals.photo}
          user={selectedUser}
          onClose={() => { setModals(prev => ({ ...prev, photo: false })); setSelectedUser(null); }}
          onUpdatePhoto={handleUpdatePhoto}
        />
      </div>
    </>
  );
}