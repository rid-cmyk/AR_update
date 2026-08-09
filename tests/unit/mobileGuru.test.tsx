import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MobileGuruDashboard from "@/app/m/guru/dashboard/page";
import MobileGuruAbsensi from "@/app/m/guru/absensi/page";
import MobileGuruHafalan from "@/app/m/guru/hafalan/page";
import MobileGuruJadwal from "@/app/m/guru/jadwal/page";
import MobileGuruUjian from "@/app/m/guru/ujian/page";

describe("Mobile Guru Pages (Real API Connection, Compact Bar & No Dummy Data)", () => {
  describe("MobileGuruDashboard", () => {
    it("renders Ahlan wa Sahlan header and statistical cards", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileGuruDashboard)
      );
      expect(html).toContain("Ahlan wa Sahlan, Ustadz!");
      expect(html).toContain("Statistik Halaqah Sendiri");
      expect(html).toContain("Aksi Cepat");
      expect(html).toContain("Setoran Terakhir");
    });
  });

  describe("MobileGuruAbsensi", () => {
    it("renders Halaqah selector header and summary of attendance", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileGuruAbsensi)
      );
      expect(html).toContain("Halaqah Anda (Hari Ini)");
      expect(html).toContain("Hadir");
      expect(html).toContain("Izin");
      expect(html).toContain("Sakit");
      expect(html).toContain("Alpa");
    });
  });

  describe("MobileGuruHafalan", () => {
    it("renders Setoran Santri and Mushaf Al-Quran selector tabs", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileGuruHafalan)
      );
      expect(html).toContain("Setoran Santri");
      expect(html).toContain("Mushaf Al-Qur&#x27;an");
      expect(html).toContain("Cari santri di halaqah Anda...");
    });
  });

  describe("MobileGuruJadwal", () => {
    it("renders Jadwal Mengajar banner and day selector", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileGuruJadwal)
      );
      expect(html).toContain("Jadwal Mengajar");
      expect(html).toContain("Senin");
      expect(html).toContain("Selasa");
    });
  });

  describe("MobileGuruUjian", () => {
    it("renders Ujian Al-Quran Digital header and start exam button", () => {
      const html = renderToStaticMarkup(
        React.createElement(MobileGuruUjian)
      );
      expect(html).toContain("Ujian Al-Qur&#x27;an Digital");
      expect(html).toContain("KKM Per-Juz");
      expect(html).toContain("Mulai Ujian Sekarang");
      expect(html).toContain("Riwayat Ujian Halaqah");
    });
  });
});
