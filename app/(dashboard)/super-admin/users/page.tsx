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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [roleDuplicateWarning, setRoleDuplicateWarning] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);
  const [santris, setSantris] = useState<Santri[]>([]);
  const [selectedSantris, setSelectedSantris] = useState<number[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailAssignedSantris, setDetailAssignedSantris] = useState<User[]>([]);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      console.log("Fetched users:", data);
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
      console.log("Fetching roles...");
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      console.log("Fetched roles:", data);
      setRoles(data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      message.error("Error fetching roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSantris();
  }, []);

  const fetchSantris = async () => {
    try {
      const res = await fetch("/api/admin/users?role=santri");
      if (!res.ok) throw new Error("Failed to fetch santris");
      const data = await res.json();
      setSantris(data);
    } catch (error: any) {
      console.error("Error fetching santris:", error);
      message.error("Error fetching santris");
    }
  };

  // User CRUD
  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      userForm.setFieldsValue({
        ...user,
        roleId: user.role.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        passCode: user.username, // Set passcode to current username for display
        noTlp: user.noTlp
      });
      // Load assigned santris for ortu users
      if (user.role.name.toLowerCase() === 'ortu') {
        fetchAssignedSantris(user.id);
      }
    } else {
      setEditingUser(null);
      userForm.resetFields();
      setSelectedSantris([]);
    }
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
      console.log("User form values:", values);

      // Check for duplicate username in frontend
      const existingUser = users.find(user =>
        user.username === values.username &&
        (!editingUser || user.id !== editingUser.id)
      );
      if (existingUser) {
        message.error("Username already exists");
        setIsUserModalOpen(false);
        userForm.resetFields();
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

      // Save user first
      const userUrl = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const userMethod = editingUser ? "PUT" : "POST";

      console.log("Sending request to:", userUrl, "with method:", userMethod);

      const userRes = await fetch(userUrl, {
        method: userMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", userRes.status);

      if (!userRes.ok) {
        let errorData;
        try {
          errorData = await userRes.json();
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), create a generic error
          errorData = { error: `Server error (${userRes.status})` };
        }
        console.error("API error:", errorData);
        throw new Error(errorData.error || `Failed to save user (${userRes.status})`);
      }

      const userData = await userRes.json();
      console.log("Success response:", userData);

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
          description: `User "${values.namaLengkap}" dengan username "${values.username || values.passCode}" telah berhasil diperbarui dalam sistem.`,
          duration: 5,
          placement: 'topRight',
          style: {
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            border: '1px solid #389e0d',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
          },
        });
      } else {
        notification.success({
          message: 'User Berhasil Ditambahkan! 🎉',
          description: `User "${values.namaLengkap}" telah berhasil ditambahkan dengan passcode: ${values.passCode}`,
          duration: 6,
          placement: 'topRight',
          style: {
            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            border: '1px solid #096dd9',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
          },
        });
      }
      setIsUserModalOpen(false);
      userForm.resetFields();
      setSelectedSantris([]);
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      if (error.message && error.message.includes("validateFields")) {
        message.error("Please fill in all required fields correctly");
      } else {
        message.error(error.message || "Error saving user");
      }
    }
  };

  const handleSaveUserWithConfirmation = async () => {
    try {
      const values = await userForm.validateFields();
      console.log("User form values:", values);

      // Check for duplicate username in frontend
      const existingUser = users.find(user =>
        user.username === values.username &&
        (!editingUser || user.id !== editingUser.id)
      );
      if (existingUser) {
        message.error("Username already exists");
        setIsUserModalOpen(false);
        userForm.resetFields();
        return;
      }

      // Use passcode as username and password for login (only for new users)
      const payload: any = {
        namaLengkap: values.namaLengkap,
        passCode: values.passCode,
        noTlp: values.noTlp,
        roleId: Number(values.roleId),
      };

      // For new users, set username and password to passcode
      if (!editingUser) {
        payload.username = values.passCode;
        payload.password = values.passCode;
      } else {
        // For editing, only update if username is provided and different
        if (values.username && values.username !== editingUser.username) {
          payload.username = values.username;
        }
        // Only update password if provided
        if (values.password) {
          payload.password = values.password;
        }
      }

      // Add santri assignments for ortu role
      const selectedRole = roles.find(r => r.id === Number(values.roleId));
      if (selectedRole && selectedRole.name.toLowerCase() === 'ortu') {
        payload.assignedSantris = selectedSantris;
      }

      // Save user first
      const userUrl = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const userMethod = editingUser ? "PUT" : "POST";

      console.log("Sending request to:", userUrl, "with method:", userMethod);

      const userRes = await fetch(userUrl, {
        method: userMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", userRes.status);

      if (!userRes.ok) {
        let errorData;
        try {
          errorData = await userRes.json();
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), create a generic error
          errorData = { error: `Server error (${userRes.status})` };
        }
        console.error("API error:", errorData);
        throw new Error(errorData.error || `Failed to save user (${userRes.status})`);
      }

      const userData = await userRes.json();
      console.log("Success response:", userData);

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

    } catch (error: any) {
      console.error("Error saving user:", error);
      if (error.message && error.message.includes("validateFields")) {
        message.error("Please fill in all required fields correctly");
      } else {
        message.error(error.message || "Error saving user");
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      console.log("Deleting user with ID:", id);
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      console.log("Delete response status:", res.status);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { error: `Server error (${res.status})` };
        }
        console.error("Delete API error:", errorData);
        throw new Error(errorData.error || `Failed to delete user (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete success response:", data);
      notification.success({
        message: 'User Berhasil Dihapus! 🗑️',
        description: `User telah berhasil dihapus dari sistem dan tidak dapat dikembalikan.`,
        duration: 5,
        placement: 'topRight',
        style: {
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          border: '1px solid #cf1322',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
        },
      });

      // Force refresh data
      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      message.error(error.message || "Error deleting user");
    }
  };

  const handleDeleteUserWithConfirmation = async (id: number) => {
    try {
      console.log("Deleting user with ID:", id);
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      console.log("Delete response status:", res.status);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { error: `Server error (${res.status})` };
        }
        console.error("Delete API error:", errorData);
        throw new Error(errorData.error || `Failed to delete user (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete success response:", data);
      notification.success({
        message: 'User Berhasil Dihapus! 🗑️',
        description: `User telah berhasil dihapus dari sistem dan tidak dapat dikembalikan.`,
        duration: 5,
        placement: 'topRight',
        style: {
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          border: '1px solid #cf1322',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
        },
      });

      // Force refresh data
      await fetchUsers();

    } catch (error: any) {
      console.error("Error deleting user:", error);
      message.error(error.message || "Error deleting user");
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
    setRoleDuplicateWarning("");
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      console.log("Role form values:", values);

      // Check for duplicate in frontend
      const normalizedName = values.name.trim().charAt(0).toUpperCase() + values.name.trim().slice(1).toLowerCase();
      const existingRole = roles.find(role =>
        role.name.toLowerCase() === normalizedName.toLowerCase() &&
        (!editingRole || role.id !== editingRole.id)
      );
      if (existingRole) {
        message.error("Role sudah ada. Gunakan nama lain.");
        setIsRoleModalOpen(false);
        roleForm.resetFields();
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      console.log("Sending role request to:", url, "with method:", method, "values:", values);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      console.log("Role response status:", res.status);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), create a generic error
          console.error("Failed to parse error response as JSON:", parseError);
          errorData = { error: `Server error (${res.status})` };
        }
        if (!errorData || !errorData.error) {
          errorData = { error: `Server error (${res.status})` };
        }
        console.error("Role API error:", errorData, "Status:", res.status);
        throw new Error(errorData.error || `Failed to save role (${res.status})`);
      }

      const data = await res.json();
      console.log("Role success response:", data);

      message.success(editingRole ? "Role berhasil diperbarui" : "Role berhasil ditambahkan");
      setIsRoleModalOpen(false);
      roleForm.resetFields();

      // Force refresh both roles and users data
      await Promise.all([fetchRoles(), fetchUsers()]);

    } catch (error: any) {
      console.error("Error saving role:", error);
      if (error.message && error.message.includes("validateFields")) {
        message.error("Masukkan nama role yang valid");
      } else if (error.message && error.message.includes("sudah ada")) {
        message.error("Role sudah ada. Gunakan nama lain.");
      } else {
        message.error(error.message || "Error menyimpan role");
      }
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      console.log("Deleting role with ID:", id);
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      console.log("Delete role response status:", res.status);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { error: `Server error (${res.status})` };
        }
        console.error("Delete role API error:", errorData);
        throw new Error(errorData.error || `Failed to delete role (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete role success response:", data);
      message.success(data.message || "Role berhasil dihapus");

      // Force refresh both roles and users data
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: any) {
      console.error("Error deleting role:", error);
      if (error.message && error.message.includes("Cannot delete role with existing users")) {
        message.error("Tidak dapat menghapus role yang masih memiliki user. Pindahkan user ke role lain terlebih dahulu.");
      } else {
        message.error(error.message || "Error menghapus role");
      }
    }
  };

  // Bulk selection functions
  const toggleUserSelect = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const toggleRoleSelect = (id: number) => {
    setSelectedRoles(prev =>
      prev.includes(id)
        ? prev.filter(roleId => roleId !== id)
        : [...prev, id]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const selectAllRoles = () => {
    setSelectedRoles(roles.map(role => role.id));
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
  };

  const clearRoleSelection = () => {
    setSelectedRoles([]);
  };

  // Selection mode functions
  const enterSelectionMode = (userId: number) => {
    setSelectionMode(true);
    setSelectedUsers([userId]);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedUsers([]);
  };

  const enterRoleSelectionMode = (roleId: number) => {
    setRoleSelectionMode(true);
    setSelectedRoles([roleId]);
  };

  const exitRoleSelectionMode = () => {
    setRoleSelectionMode(false);
    setSelectedRoles([]);
  };

  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      selectAllUsers();
    }
  };

  const toggleSelectAllRoles = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      selectAllRoles();
    }
  };

  // Bulk delete functions
  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      message.warning("Pilih user yang ingin dihapus");
      return;
    }

    try {
      message.loading({ content: `Menghapus ${selectedUsers.length} user...`, key: 'bulk-delete' });

      // Delete users one by one (could be optimized with batch API)
      const deletePromises = selectedUsers.map(id =>
        fetch(`/api/users/${id}`, { method: "DELETE" })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.filter(result => result.status === 'rejected').length;

      if (successCount > 0) {
        message.success({
          content: `${successCount} user berhasil dihapus${failCount > 0 ? `, ${failCount} gagal` : ''}`,
          key: 'bulk-delete'
        });
      } else {
        message.error({ content: 'Gagal menghapus user', key: 'bulk-delete' });
      }

      setSelectedUsers([]);
      await fetchUsers();
    } catch (error: any) {
      console.error("Bulk delete users error:", error);
      message.error({ content: 'Error menghapus user', key: 'bulk-delete' });
    }
  };

  const handleBulkDeleteRoles = async () => {
    if (selectedRoles.length === 0) {
      message.warning("Pilih role yang ingin dihapus");
      return;
    }

    try {
      message.loading({ content: `Menghapus ${selectedRoles.length} role...`, key: 'bulk-delete-roles' });

      // Delete roles one by one
      const deletePromises = selectedRoles.map(id =>
        fetch(`/api/roles/${id}`, { method: "DELETE" })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.filter(result => result.status === 'rejected').length;

      if (successCount > 0) {
        message.success({
          content: `${successCount} role berhasil dihapus${failCount > 0 ? `, ${failCount} gagal` : ''}`,
          key: 'bulk-delete-roles'
        });
      } else {
        message.error({ content: 'Gagal menghapus role', key: 'bulk-delete-roles' });
      }

      setSelectedRoles([]);
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: any) {
      console.error("Bulk delete roles error:", error);
      message.error({ content: 'Error menghapus role', key: 'bulk-delete-roles' });
    }
  };

  // Statistics
  const getUserCountByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase()).length;
  };

  const totalUsers = users.length;

  // Filter users by role
  const getUsersByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase());
  };

  // Get filtered users based on selected role filter
  const getFilteredUsers = () => {
    if (!selectedRoleFilter) {
      return users;
    }
    return users.filter((user) => user.role.name.toLowerCase() === selectedRoleFilter.toLowerCase());
  };

  const userColumns = [
    ...(selectionMode ? [{
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <Checkbox
            checked={selectedUsers.length === users.length && users.length > 0}
            indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
            onChange={toggleSelectAllUsers}
          />
        </div>
      ),
      dataIndex: "select" as const,
      key: "select",
      width: 60,
      render: (_: unknown, record: User) => (
        <div style={{ textAlign: 'center' }}>
          <Checkbox
            checked={selectedUsers.includes(record.id)}
            onChange={() => toggleUserSelect(record.id)}
          />
        </div>
      ),
    }] : []),
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{text}</span>
          {selectedUsers.includes(record.id) && selectionMode && (
            <span style={{
              backgroundColor: '#1890ff',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              SELECTED
            </span>
          )}
        </div>
      )
    },
    {
      title: "Full Name",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
      render: (text: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{text}</span>
          {selectedUsers.includes(record.id) && selectionMode && (
            <span style={{
              backgroundColor: '#1890ff',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              SELECTED
            </span>
          )}
        </div>
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
    ...(roleSelectionMode ? [{
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <Checkbox
            checked={selectedRoles.length === roles.length && roles.length > 0}
            indeterminate={selectedRoles.length > 0 && selectedRoles.length < roles.length}
            onChange={toggleSelectAllRoles}
          />
        </div>
      ),
      dataIndex: "select" as const,
      key: "select",
      width: 60,
      render: (_: unknown, record: Role) => (
        <div style={{ textAlign: 'center' }}>
          <Checkbox
            checked={selectedRoles.includes(record.id)}
            onChange={() => toggleRoleSelect(record.id)}
          />
        </div>
      ),
    }] : []),
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Role) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{text}</span>
          {selectedRoles.includes(record.id) && roleSelectionMode && (
            <span style={{
              backgroundColor: '#1890ff',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              SELECTED
            </span>
          )}
        </div>
      )
    },
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
            description="Are you sure you want to delete this role? All users with this role will be permanently deleted."
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

  const renderUserTable = (roleName: string) => {
    const filteredUsers = getUsersByRole(roleName);
    const roleUsersSelected = filteredUsers.filter(user => selectedUsers.includes(user.id)).length;

    return (
      <Card
        title={
          selectionMode ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {roleUsersSelected} selected in {roleName}
              </span>
              <Button
                type="text"
                onClick={() => {
                  const allRoleUserIds = filteredUsers.map(user => user.id);
                  const allSelected = allRoleUserIds.every(id => selectedUsers.includes(id));

                  if (allSelected) {
                    // Unselect all users in this role
                    setSelectedUsers(prev => prev.filter(id => !allRoleUserIds.includes(id)));
                  } else {
                    // Select all users in this role
                    setSelectedUsers(prev => [...new Set([...prev, ...allRoleUserIds])]);
                  }
                }}
                size="small"
                style={{ marginLeft: 'auto' }}
              >
                {roleUsersSelected === filteredUsers.length ? 'Unselect All' : 'Select All'}
              </Button>
            </div>
          ) : (
            `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Users (${filteredUsers.length})`
          )
        }
        extra={
          <Space>
            {selectionMode ? (
              <>
                {roleUsersSelected > 0 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDeleteUsers}
                    size="small"
                  >
                    Delete ({roleUsersSelected})
                  </Button>
                )}
                <Button
                  type="text"
                  onClick={exitSelectionMode}
                  size="small"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()} size="small">
                Add {roleName}
              </Button>
            )}
          </Space>
        }
      >
        <Table
          dataSource={filteredUsers}
          columns={userColumns}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 600 }}
          rowClassName={(record) =>
            selectedUsers.includes(record.id) ? 'selected-row' : ''
          }
          onRow={(record) => ({
            onClick: (e: any) => {
              if (selectionMode) {
                toggleUserSelect(record.id);
              }
            },
            onContextMenu: (e: any) => {
              e.preventDefault();
              if (!selectionMode) {
                enterSelectionMode(record.id);
              }
            },
            onTouchStart: (e: any) => {
              // For mobile long press simulation
              const timer = setTimeout(() => {
                if (!selectionMode) {
                  enterSelectionMode(record.id);
                }
              }, 500);
              const clearTimer = () => clearTimeout(timer);
              e.currentTarget.addEventListener('touchend', clearTimer, { once: true });
              e.currentTarget.addEventListener('touchmove', clearTimer, { once: true });
            },
          })}
        />
      </Card>
    );
  };

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

        {/* Role Filter */}
        <Card style={{ marginBottom: 24 }}>
          <Space>
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
                Clear Filter
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
                <Tabs
                  defaultActiveKey="all"
                  type="line"
                  size="small"
                  items={[
                    {
                      key: "all",
                      label: "All Users",
                      children: (
                        <Card
                          title={
                            selectionMode ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                  {selectedUsers.length} selected
                                </span>
                                <Button
                                  type="text"
                                  onClick={toggleSelectAllUsers}
                                  size="small"
                                  style={{ marginLeft: 'auto' }}
                                >
                                  {selectedUsers.length === users.length ? 'Unselect All' : 'Select All'}
                                </Button>
                              </div>
                            ) : (
                              `All Users ${selectedRoleFilter ? `(Filtered: ${getFilteredUsers().length}/${totalUsers})` : `(${totalUsers})`}`
                            )
                          }
                          extra={
                            <Space>
                              {selectionMode ? (
                                <>
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleBulkDeleteUsers}
                                  >
                                    Delete ({selectedUsers.length})
                                  </Button>
                                  <Button
                                    type="text"
                                    onClick={exitSelectionMode}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>
                                  Add User
                                </Button>
                              )}
                            </Space>
                          }
                        >
                          <Table
                            dataSource={getFilteredUsers()}
                            columns={userColumns}
                            rowKey="id"
                            loading={loading}
                            size="small"
                            scroll={{ x: 600 }}
                            rowClassName={(record) =>
                              selectedUsers.includes(record.id) ? 'selected-row' : ''
                            }
                            onRow={(record) => ({
                              onClick: (e: any) => {
                                if (selectionMode) {
                                  toggleUserSelect(record.id);
                                }
                              },
                              onContextMenu: (e: any) => {
                                e.preventDefault();
                                if (!selectionMode) {
                                  enterSelectionMode(record.id);
                                }
                              },
                              onTouchStart: (e: any) => {
                                // For mobile long press simulation
                                const timer = setTimeout(() => {
                                  if (!selectionMode) {
                                    enterSelectionMode(record.id);
                                  }
                                }, 500);
                                const clearTimer = () => clearTimeout(timer);
                                e.currentTarget.addEventListener('touchend', clearTimer, { once: true });
                                e.currentTarget.addEventListener('touchmove', clearTimer, { once: true });
                              },
                            })}
                          />
                        </Card>
                      ),
                    },
                    ...roles.map(role => ({
                      key: `role-${role.id}`,
                      label: role.name,
                      children: renderUserTable(role.name.toLowerCase()),
                    })),
                  ]}
                />
              ),
            },
            {
              key: "roles",
              label: "Role Management",
              children: (
                <Card
                  title={
                    roleSelectionMode ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {selectedRoles.length} selected
                        </span>
                        <Button
                          type="text"
                          onClick={toggleSelectAllRoles}
                          size="small"
                          style={{ marginLeft: 'auto' }}
                        >
                          {selectedRoles.length === roles.length ? 'Unselect All' : 'Select All'}
                        </Button>
                      </div>
                    ) : (
                      "Roles Management"
                    )
                  }
                  extra={
                    <Space>
                      {roleSelectionMode ? (
                        <>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleBulkDeleteRoles}
                          >
                            Delete ({selectedRoles.length})
                          </Button>
                          <Button
                            type="text"
                            onClick={exitRoleSelectionMode}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>
                          Add Role
                        </Button>
                      )}
                    </Space>
                  }
                >
                  <Table
                    dataSource={roles}
                    columns={roleColumns}
                    rowKey="id"
                    loading={loading}
                    size="small"
                    scroll={{ x: 500 }}
                    rowClassName={(record) =>
                      selectedRoles.includes(record.id) ? 'selected-row' : ''
                    }
                    onRow={(record) => ({
                      onClick: (e: any) => {
                        if (roleSelectionMode) {
                          toggleRoleSelect(record.id);
                        }
                      },
                      onContextMenu: (e: any) => {
                        e.preventDefault();
                        if (!roleSelectionMode) {
                          enterRoleSelectionMode(record.id);
                        }
                      },
                      onTouchStart: (e: any) => {
                        // For mobile long press simulation
                        const timer = setTimeout(() => {
                          if (!roleSelectionMode) {
                            enterRoleSelectionMode(record.id);
                          }
                        }, 500);
                        const clearTimer = () => clearTimeout(timer);
                        e.currentTarget.addEventListener('touchend', clearTimer, { once: true });
                        e.currentTarget.addEventListener('touchmove', clearTimer, { once: true });
                      },
                    })}
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
          onCancel={() => setIsUserModalOpen(false)}
          onOk={handleSaveUser}
          okText="Save"
          width={600}
        >
          <Form form={userForm} layout="vertical" size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: "Please enter username" }]}
                >
                  <Input placeholder="Enter username" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Passcode (untuk login)"
                  name="passCode"
                  rules={[{ required: true, message: "Please enter passcode" }]}
                >
                  <Input
                    placeholder="Masukkan passcode (contoh: admin123, guru456)"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: !editingUser, message: "Please enter password" }]}
                >
                  <Input.Password
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
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
            <Form.Item label="Phone Number" name="noTlp">
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                placeholder="Select a role"
                onChange={(value) => {
                  const selectedRole = roles.find(r => r.id === value);
                  if (selectedRole && selectedRole.name.toLowerCase() !== 'ortu') {
                    setSelectedSantris([]);
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

            {(() => {
              const selectedRoleId = userForm.getFieldValue('roleId');
              const selectedRole = roles.find(r => r.id === selectedRoleId);
              return selectedRole && selectedRole.name.toLowerCase() === 'ortu' ? (
                <Form.Item label="Assigned Santris">
                  <Select
                    mode="multiple"
                    placeholder="Select santris for this parent"
                    value={selectedSantris}
                    onChange={setSelectedSantris}
                    style={{ width: '100%' }}
                  >
                    {santris.map((santri) => (
                      <Select.Option key={santri.id} value={santri.id}>
                        {santri.namaLengkap} ({santri.username})
                      </Select.Option>
                    ))}
                  </Select>
                  <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Pilih santri yang akan dapat dilihat oleh orang tua ini di dashboard
                  </Typography.Text>
                </Form.Item>
              ) : null;
            })()}

            <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
              <Typography.Text strong style={{ color: '#52c41a' }}>📋 Panduan:</Typography.Text>
              <br />
              <Typography.Text style={{ fontSize: 12 }}>
                • Passcode akan digunakan sebagai username dan password untuk login<br />
                • User akan login dengan passcode yang Anda input<br />
                • Passcode akan redirect ke dashboard sesuai role<br />
                • Contoh: passcode 'guru123' → role Guru → dashboard /guru/dashboard
              </Typography.Text>
            </div>
          </Form>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              User Details
            </Space>
          }
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={600}
        >
          {detailUser && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Basic Information">
                    <p><strong>ID:</strong> {detailUser.id}</p>
                    <p><strong>Username:</strong> {detailUser.username}</p>
                    <p><strong>Full Name:</strong> {detailUser.namaLengkap}</p>
                    <p><strong>Phone:</strong> {detailUser.noTlp || 'N/A'}</p>
                    <p><strong>Role:</strong> {detailUser.role.name}</p>
                  </Card>
                </Col>
                {detailUser.role.name.toLowerCase() === 'ortu' && (
                  <Col span={12}>
                    <Card size="small" title="Assigned Santris">
                      {detailAssignedSantris.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                          {detailAssignedSantris.map((santri) => (
                            <li key={santri.id}>
                              {santri.namaLengkap} ({santri.username})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No assigned santris</p>
                      )}
                    </Card>
                  </Col>
                )}
              </Row>
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
              <div>
                <Input
                  placeholder="Enter role name"
                  onChange={(e) => {
                    const value = e.target.value;
                    const normalized = value.trim().charAt(0).toUpperCase() + value.trim().slice(1).toLowerCase();
                    const existing = roles.find(role =>
                      role.name.toLowerCase() === normalized.toLowerCase() &&
                      (!editingRole || role.id !== editingRole.id)
                    );
                    if (existing) {
                      setRoleDuplicateWarning("Role sudah ada. Gunakan nama lain.");
                    } else {
                      setRoleDuplicateWarning("");
                    }
                  }}
                />
                {roleDuplicateWarning && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {roleDuplicateWarning}
                  </div>
                )}
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
