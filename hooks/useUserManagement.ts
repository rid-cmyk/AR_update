import { useState, useCallback, useMemo, useEffect } from 'react';
import { message } from 'antd';

export interface Role {
  id: number;
  name: string;
}

export interface User {
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
  role: Role;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [santriList, setSantriList] = useState<User[]>([]);
  const [usedSantriIds, setUsedSantriIds] = useState<number[]>([]);
  const [santriAssignments, setSantriAssignments] = useState<Record<number, any>>({});
  
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [filterName, setFilterName] = useState('');
  
  const [modals, setModals] = useState({
    user: false, role: false, detail: false, photo: false, createMobile: false
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      message.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await fetch('/api/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchSantriList = useCallback(async () => {
    try {
      const res = await fetch('/api/users?role=santri');
      if (res.ok) {
        const data = await res.json();
        setSantriList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUsedSantriIds = useCallback(async () => {
    try {
      const res = await fetch('/api/ortu/used-santri');
      if (res.ok) {
        const data = await res.json();
        setUsedSantriIds(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSantriAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/ortu/santri-assignments');
      if (res.ok) {
        const data = await res.json();
        setSantriAssignments(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshAssignmentData = useCallback(async () => {
    try {
      const res = await fetch('/api/ortu/refresh-assignments', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUsedSantriIds(data.usedSantriIds || []);
        setSantriAssignments(data.santriAssignments || {});
      } else {
        fetchUsedSantriIds();
        fetchSantriAssignments();
      }
    } catch (err) {
      console.error(err);
      fetchUsedSantriIds();
      fetchSantriAssignments();
    }
  }, [fetchUsedSantriIds, fetchSantriAssignments]);

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchUsers(),
      fetchRoles(),
      fetchSantriList(),
      fetchUsedSantriIds(),
      fetchSantriAssignments()
    ]);
  }, [fetchUsers, fetchRoles, fetchSantriList, fetchUsedSantriIds, fetchSantriAssignments]);

  const checkPasscodeUnique = useCallback(async (passCode: string, excludeUserId?: number) => {
    try {
      const res = await fetch('/api/users/check-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ passCode, excludeUserId: excludeUserId || null }),
      });
      if (res.ok) {
        const data = await res.json();
        return { exists: data.exists, user: data.user };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const handleRoleSubmit = useCallback(async (values: { name: string }) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save role');
      message.success(`Role "${values.name}" berhasil ${editingRole ? 'diperbarui' : 'ditambahkan'}.`);
      setModals(prev => ({ ...prev, role: false }));
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      console.error(err);
      message.error('Gagal menyimpan role');
      throw err;
    }
  }, [editingRole, fetchRoles]);

  const handleDeleteRole = useCallback(async (role: Role) => {
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete role');
      message.success(`Role "${role.name}" berhasil dihapus`);
      fetchRoles();
    } catch (err) {
      console.error(err);
      message.error('Gagal menghapus role');
    }
  }, [fetchRoles]);

  const handleUserSubmit = useCallback(async (values: any, selectedChildren: number[] = []) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const userData = { ...values };
      if (values.roleId) {
        const selectedRole = roles.find(r => r.id === values.roleId);
        if (selectedRole?.name.toLowerCase() === 'ortu') {
          userData.children = selectedChildren;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save user');
      
      message.success(`User "${values.namaLengkap}" berhasil ${editingUser ? 'diperbarui' : 'ditambahkan'}`);
      setModals(prev => ({ ...prev, user: false, createMobile: false }));
      setEditingUser(null);
      fetchUsers();
      refreshAssignmentData();
      return resData;
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Gagal menyimpan user');
      throw err;
    }
  }, [editingUser, roles, fetchUsers, refreshAssignmentData]);

  const handleDeleteUser = useCallback(async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const errorData = await res.json();
      if (!res.ok) throw new Error(errorData.error || 'Failed to delete user');
      message.success(`User "${user.namaLengkap}" berhasil dihapus`);
      fetchUsers();
      refreshAssignmentData();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Gagal menghapus user');
      throw err;
    }
  }, [fetchUsers, refreshAssignmentData]);

  const handleUpdatePhoto = useCallback(async (userId: number, foto: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/photo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update photo');
      message.success('Foto berhasil diperbarui');
      setModals(prev => ({ ...prev, photo: false }));
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Gagal memperbarui foto');
      throw err;
    }
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    if (filterRole && filterRole !== 'all') {
      filtered = filtered.filter(u => u.role?.name?.toLowerCase() === filterRole.toLowerCase());
    }
    if (filterName) {
      const term = filterName.toLowerCase();
      filtered = filtered.filter(u => 
        u.namaLengkap?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.role?.name?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [users, filterRole, filterName]);

  return {
    allUsers: users,
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
    fetchAll, fetchUsers, fetchRoles, fetchSantriList, fetchUsedSantriIds, fetchSantriAssignments, refreshAssignmentData,
    checkPasscodeUnique,
    handleRoleSubmit, handleDeleteRole,
    handleUserSubmit, handleDeleteUser,
    handleUpdatePhoto,
    setUsers
  };
}
