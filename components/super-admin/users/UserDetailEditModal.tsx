import React from 'react';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  KeyOutlined,
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
      initialState="half"
      snapPoints={[76, "75vh", "92vh"]}
      showBottomControls={false}
    >
      {selectedUser && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              <UserOutlined />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">
                {selectedUser.namaLengkap}
              </h3>
              <p className="text-[11px] text-white/80">@{selectedUser.username}</p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border capitalize flex-shrink-0 ${getRoleBadgeColor(
                selectedUser.role?.name
              )}`}
            >
              {selectedUser.role?.name?.replace("_", " ")}
            </span>
          </div>

          {!isEditing ? (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1 text-xs">
                <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                    <MailOutlined /> Email
                  </span>
                  <span className="text-deep-space truncate text-right">
                    {selectedUser.email || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                    <PhoneOutlined /> No. Telepon / WA
                  </span>
                  <span className="text-deep-space truncate text-right">
                    {selectedUser.noTlp || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                    <HomeOutlined /> Alamat
                  </span>
                  <span className="text-deep-space text-right break-words">
                    {selectedUser.alamat || "Belum diatur"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                    <KeyOutlined /> Passcode Akses
                  </span>
                  <span className="text-emerald-600 font-mono tracking-widest flex-shrink-0">
                    ••••••
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 rounded-2xl bg-blue-green hover:bg-blue-green text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-green/20 tap-active transition-all"
                >
                  <EditOutlined />
                  <span>Ubah Data</span>
                </button>

                <button
                  onClick={() => onDeleteUser(selectedUser)}
                  className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 tap-active transition-all"
                >
                  <DeleteOutlined />
                  <span>Hapus User</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={editForm.namaLengkap}
                  onChange={(e) =>
                    setEditForm({ ...editForm, namaLengkap: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="username"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Role System *
                  </label>
                  <select
                    value={editForm.roleId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, roleId: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space focus:outline-none focus:border-blue-green"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-white">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="email@domain.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editForm.noTlp}
                    onChange={(e) =>
                      setEditForm({ ...editForm, noTlp: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alamat
                </label>
                <textarea
                  rows={2}
                  value={editForm.alamat}
                  onChange={(e) =>
                    setEditForm({ ...editForm, alamat: e.target.value })
                  }
                  placeholder="Alamat domisili..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Passcode Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={editForm.passCode}
                  onChange={(e) =>
                    setEditForm({ ...editForm, passCode: e.target.value })
                  }
                  placeholder="Kosongkan jika tidak ingin mengubah passcode"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all tap-active"
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
