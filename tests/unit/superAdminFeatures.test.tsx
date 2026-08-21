import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// 1. Mock global antd untuk mencegah hang (infinite loop) di environment Node
vi.mock("antd", () => {
  return {
    Card: ({ children, title }: any) => <div data-testid="card"><h1>{title}</h1>{children}</div>,
    Button: ({ children }: any) => <button>{children}</button>,
    Space: ({ children }: any) => <div>{children}</div>,
    Typography: { 
      Title: ({ children }: any) => <h2>{children}</h2>, 
      Text: ({ children }: any) => <span>{children}</span> 
    },
    Row: ({ children }: any) => <div>{children}</div>,
    Col: ({ children }: any) => <div>{children}</div>,
    Tabs: ({ items }: any) => (
      <div>
        {items?.map((i: any) => (
          <div key={i.key}>
            {i.label} {i.children}
          </div>
        ))}
      </div>
    ),
    Form: Object.assign(({ children }: any) => <form>{children}</form>, {
      useForm: () => [{ setFieldsValue: vi.fn(), resetFields: vi.fn(), getFieldValue: vi.fn(), validateFields: vi.fn().mockResolvedValue({}) }],
      useWatch: vi.fn(),
      Item: ({ children, label }: any) => <div><label>{label}</label>{children}</div>
    }),
    Input: Object.assign((props: any) => <input {...props} />, {
      TextArea: (props: any) => <textarea {...props} />
    }),
    Select: Object.assign(({ children }: any) => <select>{children}</select>, {
      Option: ({ children, value }: any) => <option value={value}>{children}</option>
    }),
    DatePicker: () => <input type="date" />,
    Table: ({ dataSource }: any) => (
      <table>
        <tbody>
          {dataSource?.map((row: any, i: number) => (
            <tr key={i}><td>{row.judul || row.id || row.namaLengkap}</td></tr>
          ))}
        </tbody>
      </table>
    ),
    Popconfirm: ({ children }: any) => <div>{children}</div>,
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
    Modal: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>,
    InputNumber: () => <input type="number" />,
    Switch: () => <input type="checkbox" />,
    Tag: ({ children }: any) => <span>{children}</span>,
    Divider: () => <hr />,
    Upload: ({ children }: any) => <div>{children}</div>,
    Avatar: ({ children, icon, src }: any) => <span>{icon || src || children}</span>,
    Badge: ({ children, count }: any) => <span>{count}{children}</span>,
    Tooltip: ({ children }: any) => <span>{children}</span>,
    Descriptions: Object.assign(({ children, title }: any) => <div>{title}{children}</div>, {
      Item: ({ children, label }: any) => <div><label>{label}</label>{children}</div>
    })
  };
});

// Removed icons mock as they don't cause SSR hangs

// Mock Custom UI & Layout Components
vi.mock("@/components/ui/WebSideDrawer", () => ({
  default: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>
}));
vi.mock("@/components/super-admin/layout/AdminHeaderCard", () => ({
  default: ({ title, subtitle }: any) => <div><h1>{title}</h1><h2>{subtitle}</h2></div>
}));

// 2. Mock Custom Hooks untuk skenario data (Users & Pengumuman)
vi.mock("@/hooks/useUserManagement", () => ({
  useUserManagement: () => ({
    allUsers: [],
    filteredUsers: [{ id: 1, namaLengkap: "Budi Santoso", role: { name: "super_admin" } }],
    roles: [{ id: 1, name: "super_admin", description: "Admin" }],
    santriList: [],
    usedSantriIds: [],
    santriAssignments: [],
    loading: false,
    rolesLoading: false,
    filterRole: "", setFilterRole: vi.fn(),
    filterName: "", setFilterName: vi.fn(),
    modals: { user: false, role: false, detail: false, photo: false },
    setModals: vi.fn(),
    editingUser: null, setEditingUser: vi.fn(),
    editingRole: null, setEditingRole: vi.fn(),
    selectedUser: null, setSelectedUser: vi.fn(),
    fetchAll: vi.fn(),
    checkPasscodeUnique: vi.fn(),
    handleRoleSubmit: vi.fn(), handleDeleteRole: vi.fn(),
    handleUserSubmit: vi.fn(), handleDeleteUser: vi.fn(),
    handleUpdatePhoto: vi.fn(),
  }),
}));

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useResourceCRUD: () => ({
      data: [
        {
          id: 1,
          judul: "Test Pengumuman",
          isi: "Ini isi pengumuman sistem",
          tanggal: new Date().toISOString(),
          targetAudience: "semua",
          creator: { id: 1, namaLengkap: "Admin", role: { name: "super_admin" } }
        },
      ],
      loading: false,
      isModalOpen: false,
      editingItem: null,
      openModal: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    }),
  };
});

// 3. Import Target Components
import SuperAdminUsersManagement from "@/app/(dashboard)/super-admin/users/page";
import PengumumanClient from "@/app/(dashboard)/super-admin/pengumuman/PengumumanClient";
import AdminSettingsHub from "@/components/super-admin/settings/AdminSettingsHub";

// 4. Test Suites
describe("Super Admin Dashboard Feature Units", () => {
  
  describe("1. Manajemen Users & Roles", () => {
    it("renders page structure and access cards securely", () => {
      const html = renderToStaticMarkup(<SuperAdminUsersManagement />);
      expect(html).toContain("Manajemen User &amp; Role"); // Dari mocked AdminHeaderCard title
      expect(html).toContain("Super Admin Access");
      expect(html).toContain("Akses Eksklusif");
    });
  });

  describe("2. Pengumuman Sistem", () => {
    it("renders announcements correctly matching with hook state", () => {
      const html = renderToStaticMarkup(<PengumumanClient initialPengumuman={[]} />);
      expect(html).toContain("Pengumuman");
      expect(html).toContain("Buat dan kelola pengumuman");
      expect(html).toContain("Test Pengumuman"); // Ter-render dari table dummy/mocked state
    });
  });

  describe("3. Pengaturan Sistem Global", () => {
    it("renders AdminSettingsHub tabs correctly", () => {
      const html = renderToStaticMarkup(<AdminSettingsHub />);
      // Assert proper configuration tabs are rendered 
      expect(html).toContain("Umum &amp; Akademik");
      expect(html).toContain("Manajemen Halaqah &amp; Guru");
      expect(html).toContain("Konfigurasi Ujian");
      expect(html).toContain("Hak Akses &amp; Pengguna");
    });
  });

});
