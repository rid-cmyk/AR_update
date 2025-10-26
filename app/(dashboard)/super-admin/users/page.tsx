"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  notification,
  Select,
  Table,
  Tabs,
  Checkbox,
  Divider,
  Typography,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import LayoutApp from "@/components/layout/LayoutApp";
import PasscodeInput from "@/components/auth/PasscodeInput";

interface Role {
  id: number;
  name: string;
  userCount?: number;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
  assignedSantris?: User[];
}

interface Santri {
  id: number;
  username: string;
  namaLengkap: string;
}

export default function UsersPageEnhanced() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);
  const [searchName, setSearchName] = useState<string>("");
  const [santris, setSantris] = useState<Santri[]>([]);
  const [filteredSantris, setFilteredSantris] = useState<Santri[]>([]);
  const [santriSearchName, setSantriSearchName] = useState<string>("");
  const [selectedSantris, setSelectedSantris] = useState<number[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailAssignedSantris, setDetailAssignedSantris] = useState<User[]>([]);
  const [assignedSantriIds, setAssignedSantriIds] = useState<number[]>([]);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      message.error("Error fetching roles");
    }
  };

  const fetchSantris = async () => {
    try {
      const res = await fetch("/api/admin/users?role=santri");
      if (!res.ok) throw new Error("Failed to fetch santris");
      const data = await res.json();
      setSantris(data);
      setFilteredSantris(data);
    } catch (error: any) {
      console.error("Error fetching santris:", error);
      message.error("Error fetching santris");
    }
  };

  const fetchAssignedSantriIds = async () => {
    try {
      const res = await fetch("/api/admin/assigned-santris");
      if (!res.ok) throw new Error("Failed to fetch assigned santris");
      const data = await res.json();
      setAssignedSantriIds(data);
    } catch (error: any) {
      console.error("Error fetching assigned santris:", error);
      setAssignedSantriIds([]);
    }
  };

  // Filter santris based on search name and availability
  const getAvailableSantris = () => {
    // Get santris that are not assigned to other ortu
    // But include santris that are assigned to current editing user (if any)
    const currentUserAssignedSantris = editingUser ? selectedSantris : [];
    
    return santris.filter(santri => {
      // Include if not assigned to anyone
      const isNotAssigned = !assignedSantriIds.includes(santri.id);
      // Or include if assigned to current editing user
      const isAssignedToCurrentUser = currentUserAssignedSantris.includes(santri.id);
      
      return isNotAssigned || isAssignedToCurrentUser;
    });
  };

  const handleSantriSearch = (searchValue: string) => {
    setSantriSearchName(searchValue);
    const availableSantris = getAvailableSantris();
    
    if (!searchValue.trim()) {
      setFilteredSantris(availableSantris);
    } else {
      const filtered = availableSantris.filter((santri) =>
        santri.namaLengkap.toLowerCase().includes(searchValue.toLowerCase()) ||
        santri.username.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredSantris(filtered);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSantris();
    fetchAssignedSantriIds();
  }, []);

  // User CRUD
  const openUserModal = async (user?: User) => {
    // Refresh assigned santris data
    await fetchAssignedSantriIds();
    
    if (user) {
      setEditingUser(user);
      setSelectedRoleId(user.role.id);
      userForm.setFieldsValue({
        roleId: user.role.id,
        namaLengkap: user.namaLengkap,
        passCode: "", // Don't pre-fill passcode for security
        noTlp: user.noTlp
      });
      // Load assigned santris for ortu users
      if (user.role.name.toLowerCase() === 'ortu') {
        await fetchAssignedSantris(user.id);
      }
    } else {
      setEditingUser(null);
      setSelectedRoleId(null);
      userForm.resetFields();
      setSelectedSantris([]);
    }
    
    // Update filtered santris based on availability
    const availableSantris = getAvailableSantris();
    setFilteredSantris(availableSantris);
    setSantriSearchName('');
    
    setIsUserModalOpen(true);
  };

  const fetchAssignedSantris = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/assigned-santris`);
      if (!res.ok) throw new Error("Failed to fetch assigned santris");
      const data = await res.json();
      setSelectedSantris(data.map((s: any) => s.santriId));
    } catch (error: any) {
      console.error("Error fetching assigned santris:", error);
      setSelectedSantris([]);
    }
  };

  const openDetailModal = async (user: User) => {
    setDetailUser(user);
    if (user.role.name.toLowerCase() === 'ortu') {
      try {
        const res = await fetch(`/api/users/${user.id}/assigned-santris`);
        if (!res.ok) throw new Error("Failed to fetch assigned santris");
        const data = await res.json();
        setDetailAssignedSantris(data);
      } catch (error: any) {
        console.error("Error fetching assigned santris:", error);
        setDetailAssignedSantris([]);
      }
    } else {
      setDetailAssignedSantris([]);
    }
    setIsDetailModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields();
      
      // Check for duplicate passcode (which will be used as username)
      const existingUser = users.find(user =>
        user.username === values.passCode &&
        (!editingUser || user.id !== editingUser.id)
      );
      if (existingUser) {
        message.error("Passcode sudah digunakan oleh user lain. Gunakan passcode yang berbeda.");
        return;
      }

      // Use passcode as username and password for login
      const payload: any = {
        username: values.passCode, // Use passcode as username
        password: values.passCode, // Use passcode as password
        namaLengkap: values.namaLengkap,
        passCode: values.passCode,
        noTlp: values.noTlp,
        roleId: Number(values.roleId),
      };

      // Add santri assignments for ortu role
      const selectedRole = roles.find(r => r.id === Number(values.roleId));
      if (selectedRole && selectedRole.name.toLowerCase() === 'ortu') {
        payload.assignedSantris = selectedSantris;
      }

      // Save user
      const userUrl = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const userMethod = editingUser ? "PUT" : "POST";

      const userRes = await fetch(userUrl, {
        method: userMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!userRes.ok) {
        let errorData;
        try {
          errorData = await userRes.json();
        } catch (parseError) {
          errorData = { error: `Server error (${userRes.status})` };
        }
        throw new Error(errorData.error || `Failed to save user (${userRes.status})`);
      }

      const userData = await userRes.json();

      // If this is a parent user, save the santri assignments
      if (selectedRole && selectedRole.name.toLowerCase() === 'ortu') {
        const userId = userData.id || editingUser?.id;
        if (userId) {
          await fetch(`/api/users/${userId}/assigned-santris`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedSantris: selectedSantris }),
          });
        }
      }

      if (editingUser) {
        notification.success({
          message: 'User Berhasil Diperbarui! 🎉',
          description: `User "${values.namaLengkap}" telah berhasil diperbarui dalam sistem.`,
          duration: 5,
          placement: 'topRight',
        });
      } else {
        notification.success({
          message: 'User Berhasil Ditambahkan! 🎉',
          description: `User "${values.namaLengkap}" telah berhasil ditambahkan dengan passcode: ${values.passCode}`,
          duration: 6,
          placement: 'topRight',
        });
      }
      
      setIsUserModalOpen(false);
      userForm.resetFields();
      setSelectedSantris([]);
      setSelectedRoleId(null);
      setSantriSearchName('');
      fetchUsers();
      fetchAssignedSantriIds(); // Refresh assigned santris after save
    } catch (error: any) {
      console.error("Error saving user:", error);
      message.error(error.message || "Error saving user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        
        // Handle specific error cases
        if (res.status === 400 && errorData.error?.includes('super-admin')) {
          message.error('Tidak dapat menghapus user super-admin');
          return;
        }
        
        if (res.status === 400 && errorData.error?.includes('referenced')) {
          message.error('Tidak dapat menghapus user yang masih memiliki data terkait. Hubungi developer untuk penanganan khusus.');
          return;
        }
        
        throw new Error(errorData.error || `Failed to delete user (${res.status})`);
      }

      const responseData = await res.json();
      
      notification.success({
        message: 'User Berhasil Dihapus! 🗑️',
        description: `User "${responseData.deletedUser?.namaLengkap || 'Unknown'}" dan semua data terkait telah berhasil dihapus dari sistem.`,
        duration: 6,
        placement: 'topRight',
      });

      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      
      // Show more specific error messages
      if (error.message?.includes('super-admin')) {
        message.error('Tidak dapat menghapus user super-admin');
      } else if (error.message?.includes('referenced')) {
        message.error('User masih memiliki data terkait yang tidak dapat dihapus');
      } else if (error.message?.includes('not found')) {
        message.error('User tidak ditemukan');
      } else {
        message.error(error.message || "Terjadi kesalahan saat menghapus user");
      }
    }
  };

  // Role CRUD
  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue(role);
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      
      // Check for duplicate in frontend
      const normalizedName = values.name.trim().charAt(0).toUpperCase() + values.name.trim().slice(1).toLowerCase();
      const existingRole = roles.find(role =>
        role.name.toLowerCase() === normalizedName.toLowerCase() &&
        (!editingRole || role.id !== editingRole.id)
      );
      if (existingRole) {
        message.error("Role sudah ada. Gunakan nama lain.");
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to save role (${res.status})`);
      }

      message.success(editingRole ? "Role berhasil diperbarui" : "Role berhasil ditambahkan");
      setIsRoleModalOpen(false);
      roleForm.resetFields();
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: any) {
      console.error("Error saving role:", error);
      message.error(error.message || "Error menyimpan role");
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        
        // Handle specific error messages gracefully
        if (errorData.error && errorData.error.includes("Cannot delete role with existing users")) {
          message.error("Tidak dapat menghapus role yang masih memiliki user. Pindahkan user ke role lain terlebih dahulu.");
          return;
        }
        
        message.error(errorData.error || `Failed to delete role (${res.status})`);
        return;
      }

      const data = await res.json();
      message.success(data.message || "Role berhasil dihapus");
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: any) {
      console.error("Error deleting role:", error);
      message.error("Error menghapus role");
    }
  };

  // Statistics
  const getUserCountByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase()).length;
  };

  const totalUsers = users.length;

  // Get filtered users based on selected role filter and search name
  const getFilteredUsers = () => {
    let filteredUsers = users;
    
    // Filter by role if selected
    if (selectedRoleFilter) {
      filteredUsers = filteredUsers.filter((user) => 
        user.role.name.toLowerCase() === selectedRoleFilter.toLowerCase()
      );
    }
    
    // Filter by name if search term exists
    if (searchName.trim()) {
      filteredUsers = filteredUsers.filter((user) =>
        user.namaLengkap.toLowerCase().includes(searchName.toLowerCase()) ||
        user.username.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filteredUsers;
  };

  const userColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Full Name", dataIndex: "namaLengkap", key: "namaLengkap" },
    { 
      title: "Passcode", 
      dataIndex: "username", 
      key: "passcode",
      render: (username: string) => (
        <span style={{ 
          fontFamily: 'monospace', 
          backgroundColor: '#f0f0f0', 
          padding: '2px 6px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {username}
        </span>
      )
    },
    { title: "Phone", dataIndex: "noTlp", key: "noTlp" },
    { title: "Role", dataIndex: ["role", "name"], key: "role" },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
            size="small"
          >
            Detail
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openUserModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title={`Konfirmasi Hapus User: ${record.namaLengkap}`}
            description={`Apakah Anda yakin ingin menghapus user "${record.namaLengkap}" (${record.username})? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Role Name", dataIndex: "name", key: "name" },
    {
      title: "Users Count",
      dataIndex: "userCount",
      key: "userCount",
      width: 120,
      render: (count: number) => (
        <span style={{ fontWeight: 'bold', color: count > 0 ? '#1890ff' : '#666' }}>
          {count || 0}
        </span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Role) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openRoleModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Role"
            description="Are you sure you want to delete this role?"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Users Management</h1>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          {roles.map((role, index) => {
            const colors = ["#1890ff", "#722ed1", "#eb2f96", "#52c41a", "#faad14", "#f5222d"];
            return (
              <Col xs={24} sm={12} md={6} key={role.id}>
                <Card>
                  <Statistic
                    title={role.name}
                    value={getUserCountByRole(role.name.toLowerCase())}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: colors[index % colors.length] }}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap>
            <span style={{ fontWeight: 'bold' }}>Filter by Role:</span>
            <Select
              placeholder="Select role to filter"
              allowClear
              style={{ minWidth: 200 }}
              value={selectedRoleFilter}
              onChange={(value) => setSelectedRoleFilter(value)}
            >
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.name.toLowerCase()}>
                  {role.name} ({getUserCountByRole(role.name.toLowerCase())})
                </Select.Option>
              ))}
            </Select>
            {selectedRoleFilter && (
              <Button
                type="text"
                onClick={() => setSelectedRoleFilter(null)}
                size="small"
              >
                Clear Role Filter
              </Button>
            )}
            
            <Divider type="vertical" />
            
            <span style={{ fontWeight: 'bold' }}>Search by Name:</span>
            <Input
              placeholder="Search by name or username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            {searchName && (
              <Button
                type="text"
                onClick={() => setSearchName('')}
                size="small"
              >
                Clear Search
              </Button>
            )}
          </Space>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          defaultActiveKey="users"
          type="card"
          size="large"
          items={[
            {
              key: "users",
              label: "User Management",
              children: (
                <Card
                  title={`All Users ${selectedRoleFilter || searchName ? `(Filtered: ${getFilteredUsers().length}/${totalUsers})` : `(${totalUsers})`}`}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>
                      Add User
                    </Button>
                  }
                >
                  <Table
                    dataSource={getFilteredUsers()}
                    columns={userColumns}
                    rowKey="id"
                    loading={loading}
                    size="small"
                    scroll={{ x: 600 }}
                  />
                </Card>
              ),
            },
            {
              key: "roles",
              label: "Role Management",
              children: (
                <Card
                  title="Roles Management"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>
                      Add Role
                    </Button>
                  }
                >
                  <Table
                    dataSource={roles}
                    columns={roleColumns}
                    rowKey="id"
                    loading={loading}
                    size="small"
                    scroll={{ x: 500 }}
                  />
                </Card>
              ),
            },
          ]}
        />

        {/* User Modal */}
        <Modal
          title={
            <Space>
              <UserOutlined />
              {editingUser ? "Edit User" : "Add New User"}
            </Space>
          }
          open={isUserModalOpen}
          onCancel={() => {
            setIsUserModalOpen(false);
            setSelectedRoleId(null);
            setSelectedSantris([]);
            setSantriSearchName('');
          }}
          onOk={handleSaveUser}
          okText="Save"
          width={600}
        >
          <Form form={userForm} layout="vertical" size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Passcode (Username untuk Login)"
                  name="passCode"
                  rules={[{ required: true, message: "Please enter passcode" }]}
                >
                  <PasscodeInput
                    placeholder="Masukkan passcode (contoh: admin123, guru456)"
                    maxLength={10}
                    aria-label="Passcode untuk login sistem"
                    aria-describedby="passcode-help"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Full Name"
                  name="namaLengkap"
                  rules={[{ required: true, message: "Please enter full name" }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Phone Number" name="noTlp">
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="roleId"
                  rules={[{ required: true, message: "Please select a role" }]}
                >
                  <Select
                    placeholder="Select a role"
                    onChange={(value) => {
                      setSelectedRoleId(value);
                      const selectedRole = roles.find(r => r.id === value);
                      if (selectedRole && selectedRole.name.toLowerCase() !== 'ortu') {
                        setSelectedSantris([]);
                      } else if (selectedRole && selectedRole.name.toLowerCase() === 'ortu') {
                        // Refresh available santris when ortu role is selected
                        const availableSantris = getAvailableSantris();
                        setFilteredSantris(availableSantris);
                        setSantriSearchName('');
                      }
                    }}
                  >
                    {roles.map((role) => (
                      <Select.Option key={role.id} value={role.id}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>


            {(() => {
              const selectedRole = roles.find(r => r.id === selectedRoleId);
              return selectedRole && selectedRole.name.toLowerCase() === 'ortu' ? (
                <Form.Item label="Pilih Santri sebagai Anak">
                  <div style={{ marginBottom: '8px' }}>
                    <Input
                      placeholder="Cari santri berdasarkan nama..."
                      value={santriSearchName}
                      onChange={(e) => handleSantriSearch(e.target.value)}
                      style={{ marginBottom: '8px' }}
                      allowClear
                    />
                  </div>
                  <Select
                    mode="multiple"
                    placeholder="Pilih santri yang akan menjadi anak dari orang tua ini"
                    value={selectedSantris}
                    onChange={setSelectedSantris}
                    style={{ width: '100%' }}
                    showSearch={false}
                    filterOption={false}
                    notFoundContent={
                      santriSearchName && filteredSantris.length === 0 
                        ? "Tidak ada santri yang ditemukan" 
                        : "Pilih santri dari daftar"
                    }
                  >
                    {filteredSantris.map((santri) => (
                      <Select.Option key={santri.id} value={santri.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><strong>{santri.namaLengkap}</strong></span>
                          <span style={{ color: '#666', fontSize: '12px' }}>({santri.username})</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    💡 <strong>Panduan:</strong> Pilih santri yang akan dapat dilihat dan dipantau oleh orang tua ini di dashboard. 
                    Gunakan kotak pencarian di atas untuk mencari santri berdasarkan nama.
                    <br />
                    ✅ <strong>Tersedia:</strong> {getAvailableSantris().length} santri yang belum di-assign ke ortu lain.
                  </Typography.Text>
                  {selectedSantris.length > 0 && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                      <Typography.Text strong style={{ color: '#0369a1', fontSize: '12px' }}>
                        Santri Terpilih ({selectedSantris.length}):
                      </Typography.Text>
                      <div style={{ marginTop: '4px' }}>
                        {selectedSantris.map(santriId => {
                          const santri = santris.find(s => s.id === santriId);
                          return santri ? (
                            <span key={santriId} style={{ 
                              display: 'inline-block', 
                              margin: '2px', 
                              padding: '2px 6px', 
                              backgroundColor: '#dbeafe', 
                              borderRadius: '12px', 
                              fontSize: '11px',
                              color: '#1e40af'
                            }}>
                              {santri.namaLengkap}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </Form.Item>
              ) : null;
            })()}

            <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
              <Typography.Text strong style={{ color: '#52c41a' }}>📋 Panduan Passcode:</Typography.Text>
              <br />
              <Typography.Text style={{ fontSize: 12 }} id="passcode-help">
                • <strong>Passcode = Username = Password</strong> untuk login<br />
                • User akan login menggunakan passcode ini<br />
                • Setiap passcode harus unik (tidak boleh sama)<br />
                • Contoh: 'admin123', 'guru456', 'santri789'<br />
                • Passcode akan redirect ke dashboard sesuai role
              </Typography.Text>
            </div>
          </Form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Detail User</span>
            </div>
          }
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          ]}
          width={700}
        >
          {detailUser && (
            <div style={{ padding: '16px 0' }}>
              {/* Header User Info */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '24px', 
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {detailUser.namaLengkap}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {detailUser.role.name.toUpperCase()}
                </div>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={detailUser.role.name.toLowerCase() === 'ortu' ? 12 : 24}>
                  <Card 
                    title={
                      <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                        📋 Informasi Dasar
                      </span>
                    }
                    variant="borderless"
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ lineHeight: '2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>ID:</span>
                        <span style={{ fontWeight: 'bold' }}>{detailUser.id}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>Passcode:</span>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: '#f0f0f0', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {detailUser.username}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>Nama Lengkap:</span>
                        <span style={{ fontWeight: 'bold' }}>{detailUser.namaLengkap}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>No. Telepon:</span>
                        <span style={{ fontWeight: 'bold' }}>{detailUser.noTlp || 'Tidak ada'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>Role:</span>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: '#1890ff',
                          textTransform: 'capitalize'
                        }}>
                          {detailUser.role.name}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                {detailUser.role.name.toLowerCase() === 'ortu' && (
                  <Col span={12}>
                    <Card 
                      title={
                        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          👨‍👩‍👧‍👦 Santri yang Diawasi
                        </span>
                      }
                      variant="borderless"
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: '8px'
                      }}
                    >
                      {detailAssignedSantris.length > 0 ? (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {detailAssignedSantris.map((santri, index) => (
                            <div 
                              key={santri.id}
                              style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                marginBottom: '8px',
                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                                borderRadius: '6px',
                                border: '1px solid #f0f0f0'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>
                                  {santri.namaLengkap}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Passcode: {santri.username}
                                </div>
                              </div>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: '#52c41a', 
                                borderRadius: '50%' 
                              }} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '20px',
                          color: '#999'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '8px' }}>👥</div>
                          <div>Belum ada santri yang diassign</div>
                        </div>
                      )}
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Login Instructions */}
              <div style={{ 
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px'
              }}>
                <Typography.Text strong style={{ color: '#52c41a' }}>
                  🔑 Informasi Login:
                </Typography.Text>
                <br />
                <Typography.Text style={{ fontSize: '12px', color: '#666' }}>
                  User ini dapat login menggunakan passcode <strong>{detailUser.username}</strong> dan akan diarahkan ke dashboard sesuai role <strong>{detailUser.role.name}</strong>.
                </Typography.Text>
              </div>
            </div>
          )}
        </Modal>

        {/* Role Modal */}
        <Modal
          title={
            <Space>
              <TeamOutlined />
              {editingRole ? "Edit Role" : "Add New Role"}
            </Space>
          }
          open={isRoleModalOpen}
          onCancel={() => setIsRoleModalOpen(false)}
          onOk={handleSaveRole}
          okText="Save"
          width={400}
        >
          <Form form={roleForm} layout="vertical" size="large">
            <Form.Item
              label="Role Name"
              name="name"
              rules={[{ required: true, message: "Please enter role name" }]}
            >
              <Input placeholder="Enter role name" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}