"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Tooltip,
  Badge,
  Tabs,
  Upload,
  Descriptions
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UnlockOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  UploadOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import PhoneNumberInput from "@/components/common/PhoneNumberInput";
import { formatPhoneNumberDisplay } from "@/lib/utils/phoneFormatter";

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  email?: string;
  noTlp?: string;
  foto?: string;
  passCode?: string;
  alamat?: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
  };
}

interface Role {
  id: number;
  name: string;
}

export default function SuperAdminUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const [santriList, setSantriList] = useState<User[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [usedSantriIds, setUsedSantriIds] = useState<number[]>([]);
  const [santriAssignments, setSantriAssignments] = useState<Record<number, { santri: any; parents: any[] }>>({});
  const [passcodeValidation, setPasscodeValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({ isValid: true, message: '', isChecking: false });
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setAllUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Gagal memuat data role');
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch santri list for ortu selection
  const fetchSantriList = async () => {
    try {
      const response = await fetch('/api/users?role=santri');
      if (!response.ok) throw new Error('Failed to fetch santri');
      const data = await response.json();
      setSantriList(data);
    } catch (error) {
      console.error('Error fetching santri:', error);
      message.error('Gagal memuat data santri');
    }
  };

  // Fetch used santri IDs (santri yang sudah punya ortu)
  const fetchUsedSantriIds = async () => {
    try {
      const response = await fetch('/api/ortu/used-santri');
      if (!response.ok) throw new Error('Failed to fetch used santri');
      const data = await response.json();
      setUsedSantriIds(data);
    } catch (error) {
      console.error('Error fetching used santri:', error);
      // Don't show error as this is optional
    }
  };

  // Fetch detailed santri assignments
  const fetchSantriAssignments = async () => {
    try {
      const response = await fetch('/api/ortu/santri-assignments');
      if (!response.ok) throw new Error('Failed to fetch santri assignments');
      const data = await response.json();
      setSantriAssignments(data);
    } catch (error) {
      console.error('Error fetching santri assignments:', error);
    }
  };

  // Fetch children for specific user (ortu)
  const fetchUserChildren = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/children`);
      if (!response.ok) throw new Error('Failed to fetch user children');
      const childrenIds = await response.json();
      setSelectedChildren(childrenIds);

      // Refresh used santri list to get latest data
      refreshAssignmentData();
    } catch (error) {
      console.error('Error fetching user children:', error);
      setSelectedChildren([]);
    }
  };

  // Refresh all assignment data efficiently
  const refreshAssignmentData = async () => {
    try {
      const response = await fetch('/api/ortu/refresh-assignments', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to refresh assignments');
      const data = await response.json();

      setUsedSantriIds(data.usedSantriIds);
      setSantriAssignments(data.santriAssignments);
    } catch (error) {
      console.error('Error refreshing assignment data:', error);
      // Fallback to individual fetches
      fetchUsedSantriIds();
      fetchSantriAssignments();
    }
  };

  // Check passcode uniqueness
  const checkPasscodeUniqueness = async (passcode: string, excludeUserId?: number) => {
    if (!passcode || passcode.length < 6 || passcode.length > 10) {
      setPasscodeValidation({ isValid: false, message: '', isChecking: false });
      return false;
    }

    // Validate passcode is alphanumeric (huruf dan angka)
    if (!/^[a-zA-Z0-9]+$/.test(passcode)) {
      setPasscodeValidation({ 
        isValid: false, 
        message: 'Passcode hanya boleh huruf dan angka (tanpa spasi atau simbol)', 
        isChecking: false 
      });
      return false;
    }

    setPasscodeValidation({ isValid: false, message: '', isChecking: true });

    try {
      console.log('🔍 Checking passcode:', passcode, 'excludeUserId:', excludeUserId);
      
      const response = await fetch('/api/users/check-passcode', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ 
          passCode: passcode,
          excludeUserId: excludeUserId || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check passcode');
      }

      const data = await response.json();
      console.log('✅ Passcode check result:', data);

      if (data.exists) {
        setPasscodeValidation({
          isValid: false,
          message: `Passcode sudah digunakan oleh ${data.user.namaLengkap} (@${data.user.username})`,
          isChecking: false
        });
        return false;
      } else {
        setPasscodeValidation({
          isValid: true,
          message: '✓ Passcode tersedia dan dapat digunakan',
          isChecking: false
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Error checking passcode:', error);
      setPasscodeValidation({
        isValid: false,
        message: 'Gagal mengecek passcode. Silakan coba lagi.',
        isChecking: false
      });
      return false;
    }
  };

  // Filter users based on role and name
  const applyFilters = () => {
    let filtered = [...allUsers];

    // Filter by role
    if (filterRole) {
      filtered = filtered.filter(user =>
        user.role.name.toLowerCase() === filterRole.toLowerCase()
      );
    }

    // Filter by name
    if (filterName) {
      filtered = filtered.filter(user =>
        user.namaLengkap.toLowerCase().includes(filterName.toLowerCase()) ||
        user.username.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };



  // Create or update role
  const handleRoleSubmit = async (values: { name: string }) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save role');

      if (editingRole) {
        message.success(`Role "${values.name}" berhasil diperbarui. Perubahan akan tersinkronisasi dengan semua user.`);
      } else {
        message.success(`Role "${values.name}" telah berhasil ditambahkan ke sistem dengan hak akses dasar.`);
      }

      setRoleModalVisible(false);
      setEditingRole(null);
      roleForm.resetFields();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      message.error('Gagal menyimpan role');
    }
  };

  // Delete role
  const handleDeleteRole = async (role: Role) => {
    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete role');

      message.success(`Role "${role.name}" berhasil dihapus`);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Gagal menghapus role');
    }
  };

  // Create or update user
  const handleSubmit = async (values: any) => {
    try {
      // Validate passcode if provided
      if (values.passCode) {
        if (!passcodeValidation.isValid) {
          message.error('Passcode tidak valid atau sudah digunakan. Silakan gunakan passcode lain.');
          return;
        }
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      // Add children data for ortu role
      const userData = { ...values };
      if (values.roleId) {
        const selectedRole = roles.find(r => r.id === values.roleId);
        if (selectedRole?.name.toLowerCase() === 'ortu') {
          userData.children = selectedChildren;
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      if (editingUser) {
        message.success(`User "${values.namaLengkap}" berhasil diperbarui`);
      } else {
        message.success(`User "${values.namaLengkap}" berhasil ditambahkan`);
      }

      setModalVisible(false);
      setEditingUser(null);
      setSelectedChildren([]);
      setPasscodeValidation({ isValid: false, message: '', isChecking: false });
      form.resetFields();
      fetchUsers(); // This will refresh the table with updated passcode data
      refreshAssignmentData(); // Refresh assignment data efficiently
    } catch (error: any) {
      console.error('Error saving user:', error);
      message.error(error.message || 'Gagal menyimpan user');
    }
  };



  // Delete user
  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      message.success(`User "${user.namaLengkap}" berhasil dihapus`);
      fetchUsers();
      refreshAssignmentData(); // Refresh assignment data efficiently
    } catch (error: any) {
      console.error('Error deleting user:', error);
      message.error(error.message || 'Gagal menghapus user');
    }
  };



  // Open detail modal
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // Open photo modal
  const handleManagePhoto = (user: User) => {
    setSelectedUser(user);
    setUploadedPhoto(user.foto || '');
    setPhotoModalVisible(true);
  };

  // Update photo
  const handleUpdatePhoto = async () => {
    try {
      const response = await fetch(`/api/users/${selectedUser?.id}/photo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto: uploadedPhoto }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      message.success(`Foto untuk "${selectedUser?.namaLengkap}" berhasil diperbarui`);
      setPhotoModalVisible(false);
      setSelectedUser(null);
      setUploadedPhoto('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating photo:', error);
      message.error(error.message || 'Gagal memperbarui foto');
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (info: any) => {
    if (info.file.status === 'done') {
      const photoUrl = info.file.response?.url || `/uploads/users/${info.file.response?.filename}`;
      setUploadedPhoto(photoUrl);
      message.success('Foto berhasil diupload');
    } else if (info.file.status === 'error') {
      message.error('Gagal mengupload foto');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSantriList();
    fetchUsedSantriIds();
    fetchSantriAssignments();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [filterRole, filterName, allUsers]);

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={50}
            src={record.foto}
            icon={<UserOutlined />}
            style={{
              backgroundColor: '#1890ff',
              border: '2px solid #f0f0f0',
              cursor: record.foto ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (record.foto) {
                // Show photo preview modal
                Modal.info({
                  title: `Foto ${record.namaLengkap}`,
                  content: (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <img
                        src={record.foto}
                        alt={record.namaLengkap}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      />
                    </div>
                  ),
                  width: 500,
                  okText: 'Tutup'
                });
              }
            }}
          />
          <div>
            <Text strong>{record.namaLengkap}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (roleName: string) => {
        const roleColors: Record<string, string> = {
          'super_admin': 'red',
          'admin': 'orange',
          'yayasan': 'purple',
          'guru': 'blue',
          'santri': 'green',
          'ortu': 'cyan'
        };
        return (
          <Tag color={roleColors[roleName.toLowerCase()] || 'default'}>
            {roleName}
          </Tag>
        );
      },
    },
    {
      title: 'Anak (Santri)',
      key: 'children',
      render: (record: User) => {
        // Only show for ortu role
        if (record.role.name.toLowerCase() !== 'ortu') {
          return <Text type="secondary">-</Text>;
        }

        // Get children for this ortu from santriAssignments
        const ortuAssignments = Object.values(santriAssignments || {}).filter(
          (assignment: any) => assignment.parents.some((parent: any) => parent.id === record.id)
        );

        if (ortuAssignments.length === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Belum ada anak</Text>;
        }

        return (
          <div style={{ textAlign: 'center' }}>
            <Badge
              count={ortuAssignments.length}
              style={{ backgroundColor: '#52c41a' }}
              title={`Total ${ortuAssignments.length} anak`}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              {ortuAssignments.length} anak
            </div>
          </div>
        );
      },
    },
    {
      title: 'No. Telepon',
      key: 'phone',
      render: (record: User) => (
        <div>
          {record.noTlp ? (
            <Text style={{ fontSize: 12 }}>
              {formatPhoneNumberDisplay(record.noTlp)}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Belum diset
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Passcode Login',
      key: 'passcode',
      render: (record: User) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {record.passCode ? (
              <>
                <Badge status="success" />
                <Text strong style={{ fontFamily: 'monospace', fontSize: 14 }}>
                  {record.passCode}
                </Text>
              </>
            ) : (
              <Badge status="default" text="Belum diset" />
            )}
          </div>
          {record.passCode && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Login: {record.passCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (record: User) => (
        <Space wrap>
          <Tooltip title="Lihat Detail">
            <Button
              type="default"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                // Set validation to valid for existing passcode
                if (record.passCode) {
                  setPasscodeValidation({ 
                    isValid: true, 
                    message: 'Passcode saat ini valid', 
                    isChecking: false 
                  });
                } else {
                  setPasscodeValidation({ 
                    isValid: false, 
                    message: '', 
                    isChecking: false 
                  });
                }
                // Load existing children for ortu
                if (record.role.name.toLowerCase() === 'ortu') {
                  // Fetch children data for this ortu
                  fetchUserChildren(record.id);
                }
                form.setFieldsValue({
                  ...record,
                  roleId: record.role.id
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.role.name.toLowerCase() === 'santri' && (
            <Tooltip title="Kelola Foto">
              <Button
                type="default"
                size="small"
                icon={<CameraOutlined />}
                onClick={() => handleManagePhoto(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Hapus User"
            description={`Yakin ingin menghapus user "${record.namaLengkap}"?`}
            onConfirm={() => handleDelete(record)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleColumns = [
    {
      title: 'Nama Role',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <UserSwitchOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Jumlah User',
      dataIndex: ['_count', 'users'],
      key: 'userCount',
      render: (count: number) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count || 0} user
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (record: Role) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRole(record);
              roleForm.setFieldsValue(record);
              setRoleModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Role"
            description={`Yakin ingin menghapus role "${record.name}"?`}
            onConfirm={() => handleDeleteRole(record)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader
          title="Manajemen User & Role (Super Admin)"
          subtitle="Kelola data pengguna, role, dan hak akses sistem - Akses Eksklusif Super Admin"
          breadcrumbs={[
            { title: "Super Admin Dashboard", href: "/super-admin/dashboard" },
            { title: "Manajemen User & Role" }
          ]}
          extra={
            <Space>
              {activeTab === 'users' && (
                <>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingUser(null);
                      setSelectedChildren([]);
                      setPasscodeValidation({ isValid: false, message: '', isChecking: false });
                      form.resetFields();
                      setModalVisible(true);
                    }}
                  >
                    Tambah User Baru
                  </Button>
                </>
              )}
              {activeTab === 'roles' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingRole(null);
                    roleForm.resetFields();
                    setRoleModalVisible(true);
                  }}
                >
                  Tambah Role Baru
                </Button>
              )}
            </Space>
          }
        />

        {/* Info Card */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UnlockOutlined style={{ fontSize: 24, color: '#52c41a' }} />
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
                <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
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
                <SettingOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
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

        {/* Tabs for Users and Roles */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'users',
                label: (
                  <span>
                    <UserOutlined />
                    Manajemen User
                  </span>
                ),
                children: (
                  <div>
                    {/* Filter Section */}
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col xs={24} sm={8}>
                          <Select
                            placeholder="Filter berdasarkan role"
                            value={filterRole}
                            onChange={setFilterRole}
                            allowClear
                            style={{ width: '100%' }}
                          >
                            {roles.map(role => (
                              <Option key={role.name} value={role.name}>
                                <Tag color={
                                  role.name.toLowerCase() === 'super_admin' ? 'red' :
                                    role.name.toLowerCase() === 'admin' ? 'orange' :
                                      role.name.toLowerCase() === 'yayasan' ? 'purple' :
                                        role.name.toLowerCase() === 'guru' ? 'blue' :
                                          role.name.toLowerCase() === 'santri' ? 'green' :
                                            role.name.toLowerCase() === 'ortu' ? 'cyan' : 'default'
                                }>
                                  {role.name}
                                </Tag>
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Input
                            placeholder="Cari berdasarkan nama atau username"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col xs={24} sm={8}>
                          <Text type="secondary">
                            Menampilkan {filteredUsers.length} dari {allUsers.length} user
                          </Text>
                        </Col>
                      </Row>
                    </Card>

                    <Table
                      columns={userColumns}
                      dataSource={filteredUsers}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} user`,
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'roles',
                label: (
                  <span>
                    <UserSwitchOutlined />
                    Manajemen Role
                  </span>
                ),
                children: (
                  <Table
                    columns={roleColumns}
                    dataSource={roles}
                    rowKey="id"
                    loading={rolesLoading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `Total ${total} role`,
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Add/Edit Role Modal */}
        <Modal
          title={editingRole ? "Edit Role" : "Tambah Role Baru"}
          open={roleModalVisible}
          onCancel={() => {
            setRoleModalVisible(false);
            setEditingRole(null);
            roleForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={roleForm}
            layout="vertical"
            onFinish={handleRoleSubmit}
          >
            <Form.Item
              name="name"
              label="Nama Role"
              rules={[
                { required: true, message: 'Nama role harus diisi' },
                { min: 3, message: 'Nama role minimal 3 karakter' },
              ]}
            >
              <Input placeholder="Contoh: koordinator, pengawas, dll" />
            </Form.Item>

            {!editingRole && (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 6,
                padding: 12,
                marginBottom: 16
              }}>
                <Text type="secondary">
                  <SettingOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Role baru akan otomatis mendapat hak akses dasar (dashboard, profil, pengumuman)
                </Text>
              </div>
            )}

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setRoleModalVisible(false)}>
                  Batal
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingRole ? 'Update' : 'Simpan'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add/Edit User Modal */}
        <Modal
          title={editingUser ? "Edit User" : "Tambah User Baru"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingUser(null);
            setPasscodeValidation({ isValid: false, message: '', isChecking: false });
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="Username (Nama Tampilan)"
                  rules={[
                    { required: true, message: 'Username harus diisi' },
                    { min: 3, message: 'Username minimal 3 karakter' },
                  ]}
                  extra="Username untuk tampilan profil, bukan untuk login"
                >
                  <Input placeholder="Contoh: ahmad_santri, guru_ali" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="namaLengkap"
                  label="Nama Lengkap (Data Profil)"
                  rules={[
                    { required: true, message: 'Nama lengkap harus diisi' },
                  ]}
                  extra="Nama lengkap untuk data profil dan identitas"
                >
                  <Input placeholder="Contoh: Ahmad Fauzi, Dr. Ali Rahman" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: 'email', message: 'Format email tidak valid' },
                  ]}
                >
                  <Input placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="noTlp"
                  label="No. Telepon"
                >
                  <PhoneNumberInput placeholder="Masukkan nomor telepon" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="roleId"
              label="Role"
              rules={[
                { required: true, message: 'Role harus dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih role user"
                onChange={(value) => {
                  const selectedRole = roles.find(r => r.id === value);
                  if (selectedRole?.name.toLowerCase() !== 'ortu') {
                    setSelectedChildren([]);
                  }
                }}
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Children selection for ortu role */}
            {(() => {
              const selectedRoleId = form.getFieldValue('roleId');
              const selectedRole = roles.find(r => r.id === selectedRoleId);

              if (selectedRole?.name.toLowerCase() !== 'ortu') return null;

              // Filter available santri (exclude already used ones, except current selection)
              const currentEditingId = editingUser?.id;
              const availableSantri = santriList.filter(santri => {
                // If editing, allow current children to be selected
                if (currentEditingId && selectedChildren.includes(santri.id)) {
                  return true;
                }
                // Otherwise, exclude santri that are already assigned to other ortu
                return !usedSantriIds.includes(santri.id);
              });

              return (
                <Form.Item
                  label="Pilih Anak (Santri)"
                  extra={
                    <div>
                      <div>Pilih santri yang menjadi anak dari orang tua ini. {availableSantri.length} santri tersedia.</div>
                      {usedSantriIds.length > 0 && (
                        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                          ⚠️ Santri yang sudah dipilih orang tua lain tidak dapat dipilih lagi.
                          Hapus hubungan orang tua-santri yang lama terlebih dahulu jika ingin mengubah.
                        </div>
                      )}
                    </div>
                  }
                >
                  <Select
                    mode="multiple"
                    placeholder="Pilih santri sebagai anak"
                    value={selectedChildren}
                    onChange={setSelectedChildren}
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) => {
                      const santri = santriList.find(s => s.id === option?.value);
                      return santri ?
                        santri.namaLengkap.toLowerCase().includes(input.toLowerCase()) ||
                        santri.username.toLowerCase().includes(input.toLowerCase())
                        : false;
                    }}
                    tagRender={(props) => {
                      const { label, value, closable, onClose } = props;
                      const santri = santriList.find(s => s.id === value);

                      return (
                        <Tag
                          closable={closable}
                          onClose={onClose}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            margin: '2px',
                            padding: '2px 8px',
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: '6px'
                          }}
                        >
                          <Avatar
                            size={16}
                            src={santri?.foto}
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: '#52c41a',
                              flexShrink: 0
                            }}
                          />
                          <span style={{ verticalAlign: 'middle' }}>
                            {santri?.namaLengkap || label}
                          </span>
                        </Tag>
                      );
                    }}
                  >
                    {availableSantri.map(santri => {
                      const isUsed = usedSantriIds.includes(santri.id) && !selectedChildren.includes(santri.id);
                      const assignment = santriAssignments[santri.id];
                      const parentNames = assignment?.parents?.map(p => p.namaLengkap).join(', ') || '';

                      return (
                        <Option
                          key={santri.id}
                          value={santri.id}
                          disabled={isUsed}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            opacity: isUsed ? 0.5 : 1
                          }}>
                            <Avatar size={20} src={santri.foto} icon={<UserOutlined />} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: isUsed ? 400 : 500 }}>
                                {santri.namaLengkap}
                              </div>
                              <div style={{ fontSize: 11, color: '#666' }}>
                                @{santri.username}
                                {isUsed && (
                                  <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
                                    {' • Sudah dipilih oleh: {parentNames}'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isUsed && (
                              <div style={{
                                fontSize: 10,
                                color: '#ff4d4f',
                                background: '#fff2f0',
                                padding: '2px 6px',
                                borderRadius: 4,
                                border: '1px solid #ffccc7'
                              }}>
                                Tidak Tersedia
                              </div>
                            )}
                          </div>
                        </Option>
                      );
                    })}
                  </Select>


                </Form.Item>
              );
            })()}



            <Form.Item
              name="passCode"
              label="Passcode Login (6-10 karakter)"
              rules={[
                { required: true, message: 'Passcode harus diisi' },
                { min: 6, message: 'Passcode minimal 6 karakter' },
                { max: 10, message: 'Passcode maksimal 10 karakter' },
                { pattern: /^[a-zA-Z0-9]+$/, message: 'Passcode hanya boleh huruf dan angka' },
              ]}
              extra="Passcode 6-10 karakter (huruf/angka) untuk login ke sistem"
              validateStatus={
                passcodeValidation.isChecking ? 'validating' :
                passcodeValidation.isValid ? 'success' : 'error'
              }
              help={
                passcodeValidation.isChecking ? 'Mengecek ketersediaan passcode...' :
                passcodeValidation.message || 'Masukkan 6-10 karakter unik (huruf/angka) untuk login'
              }
            >
              <Input
                placeholder="Contoh: guru123, santri01, admin2024"
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  console.log('📝 Passcode onChange:', {
                    value,
                    editingUserId: editingUser?.id,
                    oldPasscode: editingUser?.passCode
                  });
                  
                  // If empty, reset validation
                  if (!value) {
                    setPasscodeValidation({ isValid: false, message: '', isChecking: false });
                    return;
                  }
                  
                  // If editing and passcode hasn't changed, keep it valid
                  if (editingUser && value === editingUser.passCode) {
                    setPasscodeValidation({ 
                      isValid: true, 
                      message: '✓ Passcode saat ini (tidak berubah)', 
                      isChecking: false 
                    });
                    return;
                  }
                  
                  // Validate format first
                  if (value.length < 6) {
                    setPasscodeValidation({ 
                      isValid: false, 
                      message: 'Passcode minimal 6 karakter', 
                      isChecking: false 
                    });
                    return;
                  }
                  
                  if (!/^[a-zA-Z0-9]+$/.test(value)) {
                    setPasscodeValidation({ 
                      isValid: false, 
                      message: 'Passcode hanya boleh huruf dan angka (tanpa spasi/simbol)', 
                      isChecking: false 
                    });
                    return;
                  }
                  
                  // Check uniqueness for new passcode
                  if (value.length >= 6 && value.length <= 10) {
                    console.log('🔍 Calling checkPasscodeUniqueness with excludeUserId:', editingUser?.id);
                    checkPasscodeUniqueness(value, editingUser?.id);
                  }
                }}
                suffix={
                  <div style={{ minWidth: '20px', textAlign: 'center' }}>
                    {passcodeValidation.isChecking ? (
                      <span style={{ color: '#1890ff' }}>⏳</span>
                    ) : passcodeValidation.isValid && form.getFieldValue('passCode')?.length >= 6 ? (
                      <span style={{ color: '#52c41a' }}>✓</span>
                    ) : form.getFieldValue('passCode')?.length >= 6 ? (
                      <span style={{ color: '#ff4d4f' }}>✗</span>
                    ) : (
                      <span style={{ opacity: 0 }}>-</span>
                    )}
                  </div>
                }
              />
            </Form.Item>

            <Form.Item
              name="alamat"
              label="Alamat"
            >
              <Input.TextArea rows={3} placeholder="Alamat lengkap" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Batal
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  disabled={
                    passcodeValidation.isChecking ||
                    (form.getFieldValue('passCode') && (
                      !passcodeValidation.isValid ||
                      form.getFieldValue('passCode')?.length < 6 ||
                      form.getFieldValue('passCode')?.length > 10
                    ))
                  }
                  loading={loading}
                >
                  {editingUser ? 'Update' : 'Simpan'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* User Detail Modal */}
        <Modal
          title={`Detail User - ${selectedUser?.namaLengkap}`}
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedUser(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Tutup
            </Button>
          ]}
          width={600}
        >
          {selectedUser && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {selectedUser.foto ? (
                  <div>
                    <img
                      src={selectedUser.foto}
                      alt={selectedUser.namaLengkap}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #1890ff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        Modal.info({
                          title: `Foto ${selectedUser.namaLengkap}`,
                          content: (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                              <img
                                src={selectedUser.foto}
                                alt={selectedUser.namaLengkap}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '400px',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                              />
                            </div>
                          ),
                          width: 500,
                          okText: 'Tutup'
                        });
                      }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Klik foto untuk memperbesar
                      </Text>
                    </div>
                  </div>
                ) : (
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                )}
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Username (Nama Tampilan)">
                  <div>
                    <Text strong>@{selectedUser.username}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Nama tampilan profil (bukan untuk login)
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Nama Lengkap">
                  {selectedUser.namaLengkap}
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag color={
                    selectedUser.role.name.toLowerCase() === 'super_admin' ? 'red' :
                      selectedUser.role.name.toLowerCase() === 'admin' ? 'orange' :
                        selectedUser.role.name.toLowerCase() === 'yayasan' ? 'purple' :
                          selectedUser.role.name.toLowerCase() === 'guru' ? 'blue' :
                            selectedUser.role.name.toLowerCase() === 'santri' ? 'green' :
                              selectedUser.role.name.toLowerCase() === 'ortu' ? 'cyan' : 'default'
                  }>
                    {selectedUser.role.name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedUser.email || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="No. Telepon">
                  {selectedUser.noTlp ? formatPhoneNumberDisplay(selectedUser.noTlp) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Alamat">
                  {selectedUser.alamat || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Passcode Login">
                  {selectedUser.passCode ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Badge status="success" />
                        <Text strong style={{ fontFamily: 'monospace', fontSize: 16 }}>
                          {selectedUser.passCode}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Passcode 6-10 digit untuk login ke sistem
                      </Text>
                    </div>
                  ) : (
                    <div>
                      <Badge status="default" text="Belum diset" />
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        User belum bisa login tanpa passcode
                      </Text>
                    </div>
                  )}
                </Descriptions.Item>
                {selectedUser.role.name.toLowerCase() === 'ortu' && (
                  <Descriptions.Item label="Anak (Santri)">
                    {(() => {
                      const ortuAssignments = Object.values(santriAssignments || {}).filter(
                        (assignment: any) => assignment.parents.some((parent: any) => parent.id === selectedUser.id)
                      );

                      if (ortuAssignments.length === 0) {
                        return <Text type="secondary">Belum ada anak yang terdaftar</Text>;
                      }

                      return (
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Badge
                              count={ortuAssignments.length}
                              style={{ backgroundColor: '#52c41a' }}
                            />
                            <Text style={{ marginLeft: 8 }}>Total {ortuAssignments.length} anak</Text>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {ortuAssignments.map((assignment: any) => (
                              <div
                                key={assignment.santri.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '8px 12px',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: '6px',
                                  backgroundColor: '#f6ffed',
                                  minWidth: 200
                                }}
                              >
                                <Avatar
                                  size={32}
                                  src={assignment.santri.foto}
                                  icon={<UserOutlined />}
                                  style={{ backgroundColor: '#52c41a' }}
                                />
                                <div>
                                  <Text strong style={{ fontSize: 13 }}>
                                    {assignment.santri.namaLengkap}
                                  </Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    @{assignment.santri.username}
                                  </Text>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Tanggal Dibuat">
                  {new Date(selectedUser.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Terakhir Diupdate">
                  {new Date(selectedUser.updatedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>

        {/* Photo Management Modal */}
        <Modal
          title={`Kelola Foto - ${selectedUser?.namaLengkap}`}
          open={photoModalVisible}
          onCancel={() => {
            setPhotoModalVisible(false);
            setSelectedUser(null);
            setUploadedPhoto('');
          }}
          footer={[
            <Button key="cancel" onClick={() => setPhotoModalVisible(false)}>
              Batal
            </Button>,
            <Button key="save" type="primary" onClick={handleUpdatePhoto}>
              Simpan Foto
            </Button>
          ]}
        >
          {selectedUser && (
            <div>
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 6,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CameraOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Kelola Foto Santri</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hanya Super Admin yang dapat mengedit foto santri. Santri tidak dapat mengedit foto sendiri di profil.
                </Text>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {(uploadedPhoto || selectedUser.foto) ? (
                  <div>
                    <img
                      src={uploadedPhoto || selectedUser.foto}
                      alt={selectedUser.namaLengkap}
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #1890ff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {uploadedPhoto ? 'Preview foto baru' : 'Foto saat ini'}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <Avatar
                    size={150}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                )}
              </div>

              <Upload
                name="photo"
                listType="picture"
                maxCount={1}
                accept="image/*"
                action="/api/upload/photo" // You need to implement this endpoint
                onChange={handlePhotoUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  Upload Foto Baru
                </Button>
              </Upload>

              {uploadedPhoto && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Text type="success">Foto baru berhasil diupload</Text>
                </div>
              )}
            </div>
          )}
        </Modal>


      </div>
    </LayoutApp>
  );
}