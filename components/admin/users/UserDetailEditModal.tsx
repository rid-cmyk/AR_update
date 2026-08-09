import React from 'react';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  KeyOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import { User } from "@/hooks/useUserManagement";

interface UserDetailEditModalProps {
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  availableRoles: { id: number; name: string; rawName: string }[];
  onUpdateUser: () => void;
  onDeleteUser: (user: User) => void;
  updating: boolean;
  getRoleBadgeColor: (roleName?: string) => string;
}

export function UserDetailEditModal({
  selectedUser,
  setSelectedUser,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  availableRoles,
  onUpdateUser,
  onDeleteUser,
  updating,
  getRoleBadgeColor
}: UserDetailEditModalProps) {
  return (
    <MobileBottomSheet
      isOpen={!!selectedUser}
      onClose={() => {
        setSelectedUser(null);
        setIsEditing(false);
      }}
      title={isEditing ? "Ubah Data Pengguna" : "Detail Data Pengguna"}
    >
      {selectedUser && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-950 border border-navy-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 text-brand-teal flex items-center justify-center text-xl font-bold flex-shrink-0">
              <UserOutlined />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {selectedUser.namaLengkap}
              </h3>
              <p className="text-xs text-slate-400">@{selectedUser.username}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="bg-navy-950/60 border border-navy-800/80 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <IdcardOutlined /> Role System
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded border capitalize ${getRoleBadgeColor(
                      selectedUser.role?.name
                    )}`}
                  >
                    {selectedUser.role?.name?.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <UserOutlined /> Username
                  </span>
                  <span className="text-white font-mono font-medium">
                    @{selectedUser.username}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MailOutlined /> Email
                  </span>
                  <span className="text-white">
                    {selectedUser.email || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <PhoneOutlined /> No. Telepon / WA
                  </span>
                  <span className="text-white">
                    {selectedUser.noTlp || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <HomeOutlined /> Alamat
                  </span>
                  <span className="text-white text-right max-w-[180px] truncate">
                    {selectedUser.alamat || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <KeyOutlined /> Passcode Akses
                  </span>
                  <span className="text-emerald-400 font-mono tracking-widest">
                    ••••••
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 rounded-2xl bg-blue-green hover:bg-blue-green text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-green/20 tap-active transition-all"
                >
                  <EditOutlined />
                  <span>Ubah Data</span>
                </button>

                <button
                  onClick={() => onDeleteUser(selectedUser)}
                  className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 tap-active transition-all"
                >
                  <DeleteOutlined />
                  <span>Hapus User</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={editForm.namaLengkap}
                  onChange={(e) =>
                    setEditForm({ ...editForm, namaLengkap: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap..."
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="username"
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role System *
                  </label>
                  <select
                    value={editForm.roleId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, roleId: Number(e.target.value) })
                    }
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-teal"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-navy-900">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="email@domain.com"
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editForm.noTlp}
                    onChange={(e) =>
                      setEditForm({ ...editForm, noTlp: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat
                </label>
                <textarea
                  rows={2}
                  value={editForm.alamat}
                  onChange={(e) =>
                    setEditForm({ ...editForm, alamat: e.target.value })
                  }
                  placeholder="Alamat domisili..."
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passcode Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={editForm.passCode}
                  onChange={(e) =>
                    setEditForm({ ...editForm, passCode: e.target.value })
                  }
                  placeholder="Kosongkan jika tidak ingin mengubah passcode"
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-3 rounded-2xl bg-navy-700 hover:bg-navy-700 text-slate-300 font-bold text-xs transition-all tap-active"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={onUpdateUser}
                  disabled={updating}
                  className="w-full py-3 rounded-2xl bg-blue-green hover:bg-blue-green text-white font-bold text-xs shadow-lg shadow-blue-green/20 transition-all tap-active disabled:opacity-50"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </MobileBottomSheet>
  );
}
