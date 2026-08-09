import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useNotifikasi, transformNotifikasiList } from "@/hooks/useNotifikasi";
import { useOrtuChildDashboard, aggregateOrtuChildren } from "@/hooks/useOrtuChildDashboard";

const BASE_URL_MAP = { hafalan: "/guru/hafalan", target: "/guru/target" };

function apiItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: "hafalan",
    pesan: "Setoran Al-Baqarah 1-10",
    isRead: false,
    tanggal: "2026-08-05T06:00:00.000Z",
    refId: 42,
    metadata: { judul: "Update Hafalan", isi: "Santri menambah hafalan baru", creator: "Ustadz" },
    ...overrides,
  };
}

function NotifikasiProbe() {
  const { loading, filterStatus, notifikasiList, filteredData, unreadCount } = useNotifikasi({
    actionUrlMap: BASE_URL_MAP,
  });
  return (
    <div>
      {String(loading)}-{filterStatus}-{notifikasiList.length}-{filteredData.length}-{unreadCount}
    </div>
  );
}

function OrtuProbe() {
  const { children, childNames, loading, selectedChild } = useOrtuChildDashboard<{
    hafalan: unknown[];
  }>({
    transformAnak: (anak: any) => ({
      data: { hafalan: [anak] },
      child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
    }),
    initialData: { hafalan: [] },
  });
  return (
    <div>
      {children.length}-{childNames.length}-{String(loading)}-{selectedChild}
    </div>
  );
}

describe("Mobile parity (Fase 1 & 2) — shared hooks dipakai halaman mobile", () => {
  describe("useNotifikasi / transformNotifikasiList", () => {
    it("memetakan tipe API ke tipe UI (absensi→jadwal, rapot→prestasi, user→sistem)", () => {
      const list = transformNotifikasiList(
        [
          apiItem({ id: 1, type: "absensi", refId: null }),
          apiItem({ id: 2, type: "rapot", refId: null }),
          apiItem({ id: 3, type: "user", refId: null }),
          apiItem({ id: 4, type: "tak-dikenal", refId: null }),
        ],
        BASE_URL_MAP
      );
      expect(list.map((n) => n.tipe)).toEqual(["jadwal", "prestasi", "sistem", "sistem"]);
    });

    it("judul/pengirim pakai fallback bila metadata kosong", () => {
      const [n] = transformNotifikasiList(
        [apiItem({ type: "pengumuman", metadata: undefined })],
        BASE_URL_MAP
      );
      expect(n.judul).toBe("Pengumuman Baru");
      expect(n.pengirim).toBe("Sistem");
      expect(n.pesan).toBe("Setoran Al-Baqarah 1-10");
    });

    it("status read/unread mengikuti isRead", () => {
      const [unread, read] = transformNotifikasiList(
        [apiItem({ isRead: false }), apiItem({ isRead: true })],
        BASE_URL_MAP
      );
      expect(unread.status).toBe("unread");
      expect(read.status).toBe("read");
    });

    it("aksi hanya muncul saat actionUrlMap menyediakan URL; pengumuman selalu Baca Detail", () => {
      const [hafalan, tanpaUrl, pengumuman] = transformNotifikasiList(
        [
          apiItem({ type: "hafalan" }),
          apiItem({ type: "target", id: 5 }),
          apiItem({ type: "pengumuman", refId: null }),
        ],
        { hafalan: "/guru/hafalan" }
      );
      expect(hafalan.aksi).toEqual({ label: "Lihat Hafalan", url: "/guru/hafalan" });
      expect(tanpaUrl.aksi).toBeUndefined();
      expect(pengumuman.aksi).toEqual({ label: "Baca Detail", url: "#" });
    });

    it("metadata refId dipetakan ke targetId/hafalanId/pengumumanId per tipe", () => {
      const [target, hafalan, pengumuman] = transformNotifikasiList(
        [
          apiItem({ type: "target", refId: 7 }),
          apiItem({ type: "hafalan", refId: 8 }),
          apiItem({ type: "pengumuman", refId: 9 }),
        ],
        BASE_URL_MAP
      );
      expect(target.metadata?.targetId).toBe(7);
      expect(hafalan.metadata?.hafalanId).toBe(8);
      expect(pengumuman.metadata?.pengumumanId).toBe(9);
    });

    it("state awal: kosong, filter all, loading false", () => {
      const html = renderToStaticMarkup(React.createElement(NotifikasiProbe));
      expect(html).toContain("false-all-0-0-0");
    });
  });

  describe("useOrtuChildDashboard / aggregateOrtuChildren", () => {
    it("mengagregasi data per-key dari beberapa anak (anakList, bukan data.children)", () => {
      const { data, children } = aggregateOrtuChildren(
        [
          { id: 1, namaLengkap: "Ahmad", username: "ahmad123" },
          { id: 2, namaLengkap: "Budi", username: "budi456" },
        ],
        (anak: any) => ({
          data: { hafalan: [{ santriId: anak.id }] },
          child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
        }),
        { hafalan: [] }
      );
      expect(children).toHaveLength(2);
      expect(children[1].namaLengkap).toBe("Budi");
      expect(data.hafalan).toEqual([{ santriId: 1 }, { santriId: 2 }]);
    });

    it("anakList kosong/undefined menghasilkan data dan children kosong", () => {
      const { data, children } = aggregateOrtuChildren(
        undefined,
        (anak: any) => ({
          data: { hafalan: [anak] },
          child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
        }),
        { hafalan: [] }
      );
      expect(children).toEqual([]);
      expect(data.hafalan).toEqual([]);
    });

    it("state awal: children kosong, selectedChild default 'all', loading false", () => {
      const html = renderToStaticMarkup(React.createElement(OrtuProbe));
      expect(html).toContain("0-0-false-all");
    });
  });
});
