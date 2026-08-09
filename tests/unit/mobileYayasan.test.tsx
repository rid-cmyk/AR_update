import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MobileYayasanDashboard from "@/app/m/yayasan/dashboard/page";
import MobileYayasanLaporan from "@/app/m/yayasan/laporan/page";
import MobileYayasanSantri from "@/app/m/yayasan/santri/page";
import MobileYayasanRaport from "@/app/m/yayasan/raport/page";

describe("Mobile Yayasan Pages (Real Data & Skeleton States)", () => {
  describe("MobileYayasanDashboard", () => {
    it("renders Executive Pulse header, KPI section, and skeleton state while loading", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileYayasanDashboard)
      );
      expect(html).toContain("Executive Pulse Dashboard");
      expect(html).toContain("Yayasan Nurul Quran");
      expect(html).toContain("Metrik Utama Lembaga");
      expect(html).toContain("Halaqah Berkinerja Tinggi");
      expect(html).toContain("skeleton-kpi");
    });
  });

  describe("MobileYayasanLaporan", () => {
    it("renders Laporan Eksekutif header, Monthly Trend section, and status progress bars", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileYayasanLaporan)
      );
      expect(html).toContain("Laporan Eksekutif Tahfizh");
      expect(html).toContain("Pertumbuhan Hafalan Lembaga");
      expect(html).toContain("Tren Tambahan Hafalan per Bulan");
      expect(html).toContain("Distribusi Status Kelancaran Hafalan");
      expect(html).toContain("skeleton-status");
    });
  });

  describe("MobileYayasanSantri", () => {
    it("renders Direktori Santri header and search input", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileYayasanSantri)
      );
      expect(html).toContain("Direktori Santri Lembaga");
      expect(html).toContain("Cari nama santri atau halaqah...");
      expect(html).toContain("skeleton-santri");
    });
  });

  describe("MobileYayasanRaport", () => {
    it("renders Rekapitulasi Akhir Semester header and export triggers", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileYayasanRaport)
      );
      expect(html).toContain("Rekapitulasi Akhir Semester");
      expect(html).toContain("Tingkat Performa &amp; Kehadiran per Halaqah");
      expect(html).toContain("Unduh PDF");
      expect(html).toContain("Cetak A4");
      expect(html).toContain("skeleton-raport");
    });
  });
});
