import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  useUjianPenilaian,
  getPredikat,
  useBottomSheet,
  useMushafNav,
  useTableFilter,
} from "@/hooks";

function UjianProbe({ kategori }: { kategori: "kenaikan_juz" | "uas" | "mhq" | "tasmi" }) {
  const { stats } = useUjianPenilaian({
    kategoriUjian: kategori,
    juzDari: 1,
    juzSampai: 2,
  });
  return <div>{stats.rataRata}-{stats.predikat}</div>;
}

function BottomSheetProbe() {
  const { sheetState, isCollapsed } = useBottomSheet("collapsed");
  return <div>{sheetState}-{String(isCollapsed)}</div>;
}

function MushafNavProbe() {
  const { activeJuz, currentPage } = useMushafNav(1);
  return <div>juz:{activeJuz}-page:{currentPage}</div>;
}

function TableFilterProbe() {
  const data = [
    { id: 1, nama: "Ahmad", status: "aktif" },
    { id: 2, nama: "Budi", status: "nonaktif" },
  ];
  const { filteredData, total } = useTableFilter({
    data,
    searchFields: ["nama"],
  });
  return <div>count:{total}-{filteredData[0].nama}</div>;
}

describe("New Custom Hooks Test Suite", () => {
  describe("useUjianPenilaian", () => {
    it("menghitung predikat kehormatan dengan benar", () => {
      expect(getPredikat(95)).toBe("Mumtaz (A)");
      expect(getPredikat(85)).toBe("Jayyid Jiddan (B)");
      expect(getPredikat(75)).toBe("Jayyid (C)");
      expect(getPredikat(60)).toBe("Maqbul (D)");
    });

    it("kalkulasi stats Kenaikan Juz menghasilkan rata-rata default 85", () => {
      const html = renderToStaticMarkup(
        React.createElement(UjianProbe, { kategori: "kenaikan_juz" })
      );
      expect(html).toContain("85-Jayyid Jiddan (B)");
    });
  });

  describe("useBottomSheet", () => {
    it("memiliki default status collapsed", () => {
      const html = renderToStaticMarkup(React.createElement(BottomSheetProbe));
      expect(html).toContain("collapsed-true");
    });
  });

  describe("useMushafNav", () => {
    it("secara default juz 1 dipetakan ke halaman 1", () => {
      const html = renderToStaticMarkup(React.createElement(MushafNavProbe));
      expect(html).toContain("juz:1-page:1");
    });
  });

  describe("useTableFilter", () => {
    it("mengembalikan data lengkap saat query pencarian kosong", () => {
      const html = renderToStaticMarkup(React.createElement(TableFilterProbe));
      expect(html).toContain("count:2-Ahmad");
    });
  });
});
