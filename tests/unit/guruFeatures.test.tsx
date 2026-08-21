import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// 1. Mock antd secara menyeluruh untuk environment Node
vi.mock("antd", () => {
  return {
    Card: ({ children, title, className }: any) => <div data-testid="card" className={className}><h1>{title}</h1>{children}</div>,
    Button: ({ children, className }: any) => <button className={className}>{children}</button>,
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
    Select: Object.assign(({ children, value }: any) => <select value={value}>{children}</select>, {
      Option: ({ children, value }: any) => <option value={value}>{children}</option>
    }),
    DatePicker: () => <input type="date" />,
    Table: ({ dataSource, columns }: any) => {
      // antd mendukung dataIndex array path (mis. ["santri","namaLengkap"]);
      // tanpa dataIndex, arg pertama render adalah record utuh (perilaku antd).
      const getText = (row: any, dataIndex: any) =>
        Array.isArray(dataIndex)
          ? dataIndex.reduce((acc: any, k: string) => (acc == null ? acc : acc[k]), row)
          : row?.[dataIndex];
      return (
        <table>
          <tbody>
            {dataSource?.map((row: any, i: number) => (
              <tr key={i}>
                {columns?.map((col: any, j: number) => (
                  <td key={j}>
                    {col.render ? col.render(getText(row, col.dataIndex) || row, row) : getText(row, col.dataIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
    Popconfirm: ({ children }: any) => <div>{children}</div>,
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
    Modal: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>,
    InputNumber: () => <input type="number" />,
    Switch: () => <input type="checkbox" />,
    Tag: ({ children, color }: any) => <span style={{ color }}>{children}</span>,
    Divider: () => <hr />,
    Statistic: ({ title, value }: any) => <div><span>{title}</span>: <span>{value}</span></div>,
    Alert: ({ message, description }: any) => <div><h3>{message}</h3><div>{description}</div></div>,
    App: Object.assign(({ children }: any) => <div>{children}</div>, {
      useApp: () => ({
        message: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
        notification: { open: vi.fn() },
        modal: { confirm: vi.fn() }
      })
    })
  };
});

// Icons (@ant-design/icons & lucide-react) TIDAK di-mock — ikon asli aman untuk SSR
// (mengikuti superAdminFeatures.test.tsx; mock partial justru bikin ikon tak terdaftar = undefined)

// 3. Mock Next.js Navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn()
}));

// 4. Mock Custom Layour & UI Components
vi.mock("@/components/ui/WebSideDrawer", () => ({
  default: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>
}));
vi.mock("@/components/super-admin/layout/AdminHeaderCard", () => ({
  default: ({ title, subtitle, actions }: any) => <div><h1>{title}</h1><h2>{subtitle}</h2>{actions}</div>
}));
vi.mock("@/components/ui/dashboard-header", () => ({
  DashboardHeader: ({ title, subtitle, children }: any) => <div><h1>{title}</h1><h2>{subtitle}</h2>{children}</div>
}));

// Mock hooks to avoid actual fetching
vi.mock("@/hooks/useAbsensiGuru", () => ({
  useAbsensiGuru: ({ initialJadwals, initialAbsensi, initialSummary, initialHalaqahList }: any) => ({
    jadwals: initialJadwals || [],
    absensiData: initialAbsensi || [],
    summary: initialSummary || null,
    loading: false,
    selectedDate: { format: () => '2026-08-16', isAfter: () => false, isBefore: () => false },
    setSelectedDate: vi.fn(),
    halaqahList: initialHalaqahList || [],
    fetchAbsensiData: vi.fn(),
    saveAbsensi: vi.fn()
  })
}));

vi.mock("@/hooks", () => ({
  useHafalanGuru: ({ initialHafalanList, initialSantriList }: any) => ({
    hafalanList: initialHafalanList || [],
    santriList: initialSantriList || [],
    loading: false,
    isModalOpen: false,
    editingHafalan: null,
    filters: {},
    setFilters: vi.fn(),
    fetchHafalan: vi.fn(),
    saveHafalan: vi.fn(),
    deleteHafalan: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
  })
}));

// Mock Pagination
vi.mock("@/hooks/useTablePagination", () => ({
  useTablePagination: () => ({ current: 1, pageSize: 10, total: 0 })
}));

// Mock CSS Module
vi.mock("@/components/guru/absensi/Absensi.module.css", () => ({
  default: {}
}));
vi.mock("@/app/(dashboard)/guru/absensi/AbsensiClient.module.css", () => ({
  default: {}
}));

// Imports
import AbsensiClient from "@/app/(dashboard)/guru/absensi/AbsensiClient";
import HafalanClient from "@/app/(dashboard)/guru/hafalan/HafalanClient";
import { UjianFilterBar, UjianCardActions } from "@/components/guru/ujian/UjianClientComponents";

describe("Guru Dashboard Feature Units", () => {
  describe("1. Absensi Guru", () => {
    it("renders AbsensiClient structure and shows summary data", () => {
      const initialJadwals = [
        { id: 1, jamMulai: "08:00", jamSelesai: "09:30", halaqah: { namaHalaqah: "Halaqah Pagi" } }
      ];
      const initialSummary = { totalJadwal: 1, hadir: 10, izin: 2, alpha: 1 };
      const initialHalaqahList = [{ id: 1, namaHalaqah: "Halaqah Pagi", jumlahSantri: 13 }];
      const initialAbsensi = [
        { santriId: 101, jadwalId: 1, status: "masuk", santri: { namaLengkap: "Ahmad", username: "ahmad123" } }
      ];

      const html = renderToStaticMarkup(
        <AbsensiClient
          initialJadwals={initialJadwals}
          initialSummary={initialSummary}
          initialHalaqahList={initialHalaqahList}
          initialAbsensi={initialAbsensi}
        />
      );

      // Verify header components are rendered
      expect(html).toContain("Absensi Santri");
      
      // Verify halaqah tags
      expect(html).toContain("Halaqah Pagi");
      expect(html).toContain("13 santri");
      
      // Verify summary statistic
      expect(html).toContain("Total Jadwal");
      expect(html).toContain("10"); // hadir
      
      // Verify table content
      expect(html).toContain("Ahmad");
    });

    it("renders empty state correctly if no schedules exist", () => {
      const html = renderToStaticMarkup(
        <AbsensiClient
          initialJadwals={[]}
          initialSummary={{ totalJadwal: 0, hadir: 0, izin: 0, alpha: 0 }}
          initialHalaqahList={[]}
          initialAbsensi={[]}
        />
      );
      
      expect(html).toContain("Tidak ada jadwal");
    });
  });

  describe("2. Hafalan Guru", () => {
    it("renders HafalanClient and displays initial hafalan data", () => {
      const initialHafalanList = [
        { 
          id: 1, 
          santriId: 101, 
          surat: "Al-Baqarah", 
          ayatMulai: 1, 
          ayatSelesai: 5, 
          nilai: 90, 
          tanggal: "2026-08-16",
          santri: { namaLengkap: "Budi", username: "budi" }
        }
      ];
      const initialSantriList = [
        { id: 101, namaLengkap: "Budi", username: "budi" }
      ];

      const html = renderToStaticMarkup(
        <HafalanClient
          initialHafalanList={initialHafalanList as any}
          initialSantriList={initialSantriList}
        />
      );

      expect(html).toContain("Data Hafalan Santri");
      expect(html).toContain("Al-Baqarah");
      expect(html).toContain("Setoran Baru");
    });
  });

  describe("3. Ujian Guru Client Components", () => {
    it("renders UjianFilterBar properly", () => {
      const html = renderToStaticMarkup(<UjianFilterBar />);
      expect(html).toContain("Cari nama santri");
      // Radix Select tidak merender SelectContent saat SSR (dropdown tertutup),
      // jadi verifikasi struktur: kedua filter combobox (jenis & status) ter-render
      expect(html.match(/role="combobox"/g)?.length).toBe(2);
    });

    it("renders UjianCardActions properly", () => {
      const ujianDummy = { id: 1, status: "draft" };
      const html = renderToStaticMarkup(<UjianCardActions ujian={ujianDummy as any} />);
      expect(html).toContain("Detail");
    });
  });
});
