import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useJadwal, getHariColor } from "@/hooks/useJadwal";
import {
  useStatusTag,
  ABSENSI_STATUS_TAGS,
  HAFALAN_STATUS_TAGS,
  TARGET_STATUS_TAGS,
} from "@/hooks/useStatusTag";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useQuranSuratList, transformSuratList } from "@/hooks/useQuranSuratList";

function StatusProbe({ status, fallback }: { status: string; fallback?: string }) {
  const renderStatus = useStatusTag(ABSENSI_STATUS_TAGS, fallback);
  return <div>{renderStatus(status)}</div>;
}

function JadwalProbe() {
  const { jadwal } = useJadwal({ endpoint: "/api/test/jadwal" });
  return <div>{jadwal.length}</div>;
}

function SuratListProbe() {
  const { suratList } = useQuranSuratList();
  return <div>{suratList.length}</div>;
}

function PaginationProbe({ label }: { label: string }) {
  const pagination = useTablePagination({ totalLabel: label });
  const showTotal = pagination.showTotal as (total: number, range: [number, number]) => string;
  return (
    <div>
      {pagination.pageSize}-{showTotal(42, [1, 10])}
    </div>
  );
}

describe("Refactor Hooks (Fase 4) — hasil konsisten & tanpa duplikasi", () => {
  describe("useJadwal", () => {
    it("getHariColor memetakan 7 hari ke warna antd", () => {
      expect(getHariColor("Senin")).toBe("blue");
      expect(getHariColor("Selasa")).toBe("green");
      expect(getHariColor("Rabu")).toBe("orange");
      expect(getHariColor("Kamis")).toBe("red");
      expect(getHariColor("Jumat")).toBe("purple");
      expect(getHariColor("Sabtu")).toBe("cyan");
      expect(getHariColor("Minggu")).toBe("magenta");
    });

    it("getHariColor mengembalikan default untuk hari tak dikenal", () => {
      expect(getHariColor("BukanHari")).toBe("default");
    });

    it("jadwal selalu array (default [] saat data belum dimuat)", () => {
      const html = renderToStaticMarkup(React.createElement(JadwalProbe));
      expect(html).toContain(">0<");
    });
  });

  describe("useStatusTag", () => {
    it("merender Tag dengan warna & teks yang benar untuk status absensi", () => {
      const html = renderToStaticMarkup(
        React.createElement(StatusProbe, { status: "hadir" })
      );
      expect(html).toContain("Hadir");
    });

    it("fallback alpha dipakai untuk status tak dikenal (perilaku lama absensi)", () => {
      const html = renderToStaticMarkup(
        React.createElement(StatusProbe, { status: "unknown", fallback: "alpha" })
      );
      expect(html).toContain("Alpha");
    });

    it("config hafalan mencakup selesai/proses/pending", () => {
      expect(HAFALAN_STATUS_TAGS.selesai.text).toBe("Selesai");
      expect(HAFALAN_STATUS_TAGS.proses.text).toBe("Proses");
      expect(HAFALAN_STATUS_TAGS.pending.text).toBe("Pending");
    });

    it("config target mencakup selesai/aktif/tertunda", () => {
      expect(TARGET_STATUS_TAGS.selesai.text).toBe("Selesai");
      expect(TARGET_STATUS_TAGS.aktif.text).toBe("Aktif");
      expect(TARGET_STATUS_TAGS.tertunda.text).toBe("Tertunda");
    });
  });

  describe("useTablePagination", () => {
    it("menghasilkan pageSize 10 dan showTotal berlabel sesuai parameter", () => {
      const html = renderToStaticMarkup(
        React.createElement(PaginationProbe, { label: "santri" })
      );
      expect(html).toContain("10-1-10 dari 42 santri");
    });
  });

  describe("useQuranSuratList", () => {
    it("suratList selalu array (default [] saat belum dimuat)", () => {
      const html = renderToStaticMarkup(React.createElement(SuratListProbe));
      expect(html).toContain(">0<");
    });
  });

  describe("transformSuratList", () => {
    it("mengambil array data dari respons equran.id ({ code, data })", () => {
      const list = transformSuratList({
        code: 200,
        message: "success",
        data: [
          { nomor: 1, nama: "الفاتحة", namaLatin: "Al-Fatihah", jumlahAyat: 7 },
          { nomor: 2, nama: "البقرة", namaLatin: "Al-Baqarah", jumlahAyat: 286 },
        ],
      });
      expect(list).toHaveLength(2);
      expect(list[0].namaLatin).toBe("Al-Fatihah");
      expect(list[0].jumlahAyat).toBe(7);
    });

    it("mengembalikan [] saat data bukan array (bentuk lama yang salah)", () => {
      const list = transformSuratList({
        success: true,
        data: { code: 200, message: "success", data: [] },
      });
      expect(list).toEqual([]);
    });

    it("mengembalikan [] saat data null/undefined", () => {
      expect(transformSuratList(null)).toEqual([]);
      expect(transformSuratList({ code: 200 })).toEqual([]);
      expect(transformSuratList(undefined)).toEqual([]);
    });
  });
});
