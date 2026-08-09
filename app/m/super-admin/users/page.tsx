"use client";

import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  KeyOutlined,
  IdcardOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Modal, message, Spin } from "antd";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import { UserDetailEditModal } from "@/components/admin/users/UserDetailEditModal";
import { UserCreateModal } from "@/components/admin/users/UserCreateModal";
import { useUserManagement, User } from "@/hooks/useUserManagement";

function getRoleBadgeColor(roleName?: string) {
  const normalized = (roleName || "").toLowerCase().replace("_", "-");
  switch (normalized) {
    case "super-admin":
      return "bg-brand-teal/15 text-brand-teal border-brand-teal/30";
    case "admin":
      return "bg-brand-teal/15 text-brand-teal border-brand-teal/30";
    case "guru":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "santri":
      return "bg-brand-teal/15 text-brand-teal border-brand-teal/30";
    case "ortu":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "yayasan":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

const ROLE_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Guru", value: "guru" },
  { label: "Santri", value: "santri" },
  { label: "Ortu", value: "ortu" },
  { label: "Yayasan", value: "yayasan" },
];

export default function MobileSuperAdminUsers() {
  const {
    filteredUsers,
    roles,
    loading,
    filterRole, setFilterRole,
    filterName, setFilterName,
    modals, setModals,
    editingUser, setEditingUser,
    selectedUser, setSelectedUser,
    fetchAll,
    handleUserSubmit, handleDeleteUser
  } = useUserManagement();

  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editForm, setEditForm] = useState({
    namaLengkap: "",
    username: "",
    roleId: 1,
    email: "",
    noTlp: "",
    alamat: "",
    passCode: "",
  });

  const [createForm, setCreateForm] = useState({
    namaLengkap: "",
    username: "",
    roleId: 3, // default guru
    passCode: "",
    email: "",
    noTlp: "",
    alamat: "",
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleOpenDetailModal = (user: User) => {
    setSelectedUser(user);
    setIsEditing(false);
    setEditForm({
      namaLengkap: user.namaLengkap || "",
      username: user.username || "",
      roleId:
        user.role?.id ||
        roles.find((r) => r.name.toLowerCase() === user.role?.name?.toLowerCase())?.id ||
        1,
      email: user.email || "",
      noTlp: user.noTlp || "",
      alamat: user.alamat || "",
      passCode: "",
    });
  };

  const onUpdateUser = async () => {
    if (!selectedUser) return;
    if (!editForm.namaLengkap || !editForm.username || !editForm.roleId) {
      message.warning("Nama Lengkap, Username, dan Role wajib diisi!");
      return;
    }
    setUpdating(true);
    setEditingUser(selectedUser); // Ensure editingUser is set for the hook
    try {
      await handleUserSubmit({
        ...editForm,
        id: selectedUser.id,
      });
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err: any) {
      // Error handled by hook
    } finally {
      setUpdating(false);
      setEditingUser(null);
    }
  };

  const onCreateUser = async () => {
    if (!createForm.namaLengkap || !createForm.username || !createForm.roleId || !createForm.passCode) {
      message.warning("Nama Lengkap, Username, Role, dan Passcode wajib diisi!");
      return;
    }
    setCreating(true);
    setEditingUser(null);
    try {
      await handleUserSubmit(createForm);
      setCreateForm({
        namaLengkap: "",
        username: "",
        roleId: 3,
        passCode: "",
        email: "",
        noTlp: "",
        alamat: "",
      });
    } catch (err: any) {
      // Error handled by hook
    } finally {
      setCreating(false);
    }
  };

  const onDeleteUser = (user: User) => {
    Modal.confirm({
      title: "Hapus Pengguna Ini?",
      icon: <ExclamationCircleOutlined className="text-rose-400" />,
      content: `Apakah Anda yakin ingin menghapus akun ${user.namaLengkap} (@${user.username})? Tindakan ini tidak dapat dibatalkan.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await handleDeleteUser(user);
          setSelectedUser(null);
        } catch (err) {
          // Error handled by hook
        }
      },
    });
  };

  const availableRoles =
    roles.length > 0
      ? roles.map((r) => ({
          id: r.id,
          name: r.name.replace("_", " ").toUpperCase(),
          rawName: r.name,
        }))
      : [
          { id: 1, name: "SUPER ADMIN", rawName: "super_admin" },
          { id: 2, name: "ADMIN", rawName: "admin" },
          { id: 3, name: "GURU", rawName: "guru" },
          { id: 4, name: "SANTRI", rawName: "santri" },
          { id: 5, name: "ORTU", rawName: "ortu" },
          { id: 6, name: "YAYASAN", rawName: "yayasan" },
        ];

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TeamOutlined className="text-brand-teal" />
            <span>Manajemen Pengguna</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kelola akun, hak akses, dan otorisasi sistem via pop-up
          </p>
        </div>
        <button
          onClick={() => setModals(prev => ({ ...prev, createMobile: true }))}
          className="px-3.5 py-2.5 rounded-2xl bg-blue-green hover:bg-blue-green text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-green/25 transition-all tap-active flex-shrink-0"
        >
          <PlusOutlined />
          <span>Tambah</span>
        </button>
      </div>

      <div className="relative">
        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Cari nama, username, atau role..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="w-full bg-navy-900 border border-navy-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterRole(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              (filterRole || 'all') === f.value
                ? "bg-blue-green text-white shadow-md shadow-blue-green/20"
                : "bg-navy-900 border border-navy-800 text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-3">
          <Spin />
          <span>Memuat daftar pengguna...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-navy-900/40 border border-navy-800/80 rounded-2xl text-slate-400 text-sm">
          Tidak ada pengguna yang ditemukan
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => handleOpenDetailModal(u)}
              className="bg-navy-900/80 hover:bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer tap-active transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center flex-shrink-0 font-bold text-base">
                  <UserOutlined />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {u.namaLengkap}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize ${getRoleBadgeColor(
                    u.role?.name
                  )}`}
                >
                  {u.role?.name?.replace("_", " ") || "user"}
                </span>
                <RightOutlined className="text-xs text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: DETAIL & EDIT PENGGUNA */}
      <UserDetailEditModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editForm={editForm}
        setEditForm={setEditForm}
        availableRoles={availableRoles}
        onUpdateUser={onUpdateUser}
        onDeleteUser={onDeleteUser}
        updating={updating}
        getRoleBadgeColor={getRoleBadgeColor}
      />
      {/* MODAL 2: TAMBAH PENGGUNA BARU */}
      <UserCreateModal
        isOpen={modals.createMobile}
        onClose={() => setModals(prev => ({ ...prev, createMobile: false }))}
        createForm={createForm}
        setCreateForm={setCreateForm}
        availableRoles={availableRoles}
        onCreateUser={onCreateUser}
        creating={creating}
      />
    </div>
  );
}
