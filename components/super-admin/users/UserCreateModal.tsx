import React from 'react';
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  createForm: any;
  setCreateForm: React.Dispatch<React.SetStateAction<any>>;
  availableRoles: { id: number; name: string; rawName: string }[];
  onCreateUser: () => void;
  creating: boolean;
}

export function UserCreateModal({
  isOpen,
  onClose,
  createForm,
  setCreateForm,
  availableRoles,
  onCreateUser,
  creating
}: UserCreateModalProps) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pengguna Baru"
      initialState="half"
      snapPoints={[76, "75vh", "92vh"]}
      showBottomControls={false}
    >
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Nama Lengkap *
          </label>
          <input
            type="text"
            value={createForm.namaLengkap}
            onChange={(e) =>
              setCreateForm({ ...createForm, namaLengkap: e.target.value })
            }
            placeholder="Nama lengkap..."
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
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({ ...createForm, username: e.target.value })
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
              value={createForm.roleId}
              onChange={(e) =>
                setCreateForm({ ...createForm, roleId: Number(e.target.value) })
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
              Passcode Akses *
            </label>
            <input
              type="text"
              value={createForm.passCode}
              onChange={(e) =>
                setCreateForm({ ...createForm, passCode: e.target.value })
              }
              placeholder="min. 6 karakter"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              No. WhatsApp
            </label>
            <input
              type="text"
              value={createForm.noTlp}
              onChange={(e) =>
                setCreateForm({ ...createForm, noTlp: e.target.value })
              }
              placeholder="08xxxxxxxxxx"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({ ...createForm, email: e.target.value })
            }
            placeholder="email@domain.com"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Alamat
          </label>
          <textarea
            rows={2}
            value={createForm.alamat}
            onChange={(e) =>
              setCreateForm({ ...createForm, alamat: e.target.value })
            }
            placeholder="Alamat domisili..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-deep-space placeholder-slate-400 focus:outline-none focus:border-blue-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all tap-active"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onCreateUser}
            disabled={creating}
            className="w-full py-3 rounded-2xl bg-blue-green hover:bg-blue-green text-white font-bold text-xs shadow-lg shadow-blue-green/20 transition-all tap-active disabled:opacity-50"
          >
            {creating ? "Membuat..." : "Simpan Pengguna"}
          </button>
        </div>
      </div>
    </MobileBottomSheet>
  );
}
