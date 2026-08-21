import React from "react";
import type { ColumnsType } from "antd/es/table";
import {
  renderBold,
  renderTagIcon,
  renderBadgeCount,
  renderProgress,
  renderNilai,
  renderDate,
  renderDateOrNone,
  renderDeadline,
  renderStatusTag,
  renderStatusBadge,
  renderTooltipTag,
  sortByString,
  sortByNumber,
  icons,
} from "@/lib/utils/laporanColumnsUtils";
import { Progress } from "antd";

const reportTypeColumns = {
  halaqah: () => [
    {
      title: "Halaqah",
      dataIndex: "namaHalaqah",
      key: "namaHalaqah",
      render: (text: string) => renderBold(text),
      sorter: sortByString("namaHalaqah"),
    },
    {
      title: "Guru Pembimbing",
      dataIndex: "namaGuru",
      key: "namaGuru",
      render: (text: string) => renderTagIcon(text, "blue", icons.user),
    },
    {
      title: "Santri",
      dataIndex: "totalSantri",
      key: "totalSantri",
      render: (value: number) => renderBadgeCount(value, "#219ebc"),
      sorter: sortByNumber("totalSantri"),
    },
    {
      title: "Total Hafalan",
      dataIndex: "totalHafalan",
      key: "totalHafalan",
      render: (value: number) => renderTagIcon(`${value} record`, "cyan", icons.book),
      sorter: sortByNumber("totalHafalan"),
    },
    {
      title: "Total Ujian",
      dataIndex: "totalUjian",
      key: "totalUjian",
      render: (value: number) => renderTagIcon(`${value} ujian`, "orange", icons.trophy),
      sorter: sortByNumber("totalUjian"),
    },
    {
      title: "Attendance Rate",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (value: number) => renderProgress(value, { success: 80, normal: 60, format: (percent) => `${percent}%` }),
      sorter: sortByNumber("attendanceRate"),
    },
    {
      title: "Hafalan Rate",
      dataIndex: "hafalanRate",
      key: "hafalanRate",
      render: (value: number) => renderProgress(value, { success: 75, normal: 50, format: (percent) => `${percent}%` }),
      sorter: sortByNumber("hafalanRate"),
    },
  ],

  santri: () => [
    {
      title: "Nama Santri",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
      render: (text: string) => renderBold(text),
      sorter: sortByString("namaLengkap"),
    },
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (text: string) => renderTagIcon(text, "green"),
    },
    {
      title: "Total Hafalan",
      dataIndex: "totalHafalan",
      key: "totalHafalan",
      render: (value: number) => renderTagIcon(`${value} record`, "blue", icons.book),
      sorter: sortByNumber("totalHafalan"),
    },
    {
      title: "Total Ujian",
      dataIndex: "totalUjian",
      key: "totalUjian",
      render: (value: number) => renderTagIcon(`${value} ujian`, "orange", icons.trophy),
      sorter: sortByNumber("totalUjian"),
    },
    {
      title: "Target Aktif",
      dataIndex: "targetAktif",
      key: "targetAktif",
      render: (value: number) => renderTagIcon(`${value} target`, "purple", icons.clock),
      sorter: sortByNumber("targetAktif"),
    },
    {
      title: "Attendance Rate",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (value: number) => renderProgress(value, { success: 80, normal: 60 }),
      sorter: sortByNumber("attendanceRate"),
    },
    {
      title: "Last Activity",
      dataIndex: "lastActivity",
      key: "lastActivity",
      render: (date: string | null) => renderDateOrNone(date),
    },
  ],

  guru: () => [
    {
      title: "Nama Guru",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
      render: (text: string) => renderBold(text),
      sorter: sortByString("namaLengkap"),
    },
    {
      title: "Halaqah",
      dataIndex: "halaqahCount",
      key: "halaqahCount",
      render: (value: number) => renderTagIcon(`${value} halaqah`, "blue", icons.team),
      sorter: sortByNumber("halaqahCount"),
    },
    {
      title: "Total Santri",
      dataIndex: "totalSantri",
      key: "totalSantri",
      render: (value: number) => renderBadgeCount(value, "#219ebc"),
      sorter: sortByNumber("totalSantri"),
    },
    {
      title: "Permission",
      dataIndex: "permissionCount",
      key: "permissionCount",
      render: (value: number) => renderTagIcon(`${value} akses`, "green", icons.check),
      sorter: sortByNumber("permissionCount"),
    },
    {
      title: "Avg Attendance",
      dataIndex: "averageAttendance",
      key: "averageAttendance",
      render: (value: number) => renderProgress(value, { success: 80, normal: 60 }),
      sorter: sortByNumber("averageAttendance"),
    },
  ],

  ujian: () => [
    {
      title: "Santri",
      dataIndex: "santri",
      key: "santri",
      render: (text: string) => renderBold(text),
    },
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (text: string) => renderTagIcon(text, "blue"),
    },
    {
      title: "Jenis Ujian",
      dataIndex: "jenisUjian",
      key: "jenisUjian",
      render: (text: string) => renderTagIcon(text.toUpperCase(), "purple"),
    },
    {
      title: "Template",
      dataIndex: "templateUjian",
      key: "templateUjian",
    },
    {
      title: "Nilai Akhir",
      dataIndex: "nilaiAkhir",
      key: "nilaiAkhir",
      render: (value: number) => renderNilai(value, 1),
      sorter: sortByNumber("nilaiAkhir"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        renderStatusTag(status, {
          draft: "default",
          submitted: "processing",
          verified: "success",
          rejected: "error",
        }),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (date: string) => renderDate(date),
    },
    {
      title: "Verifier",
      dataIndex: "verifier",
      key: "verifier",
    },
  ],

  target: () => [
    {
      title: "Santri",
      dataIndex: "santri",
      key: "santri",
      render: (text: string) => renderBold(text),
    },
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (text: string) => renderTagIcon(text, "blue"),
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
      render: (text: string) => renderTagIcon(text, "green"),
    },
    {
      title: "Target Ayat",
      dataIndex: "ayatTarget",
      key: "ayatTarget",
      render: (value: number) => `${value} ayat`,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date: string) => renderDeadline(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        renderStatusTag(status, {
          belum: "default",
          proses: "processing",
          selesai: "success",
        }),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (value: number) => <Progress percent={value} size="small" />,
    },
  ],

  tahfidz: () => [
    {
      title: "Nama Santri",
      dataIndex: "namaSantri",
      key: "namaSantri",
      render: (text: string) => renderBold(text),
    },
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (text: string) => renderTagIcon(text, "blue"),
    },
    {
      title: "Guru",
      dataIndex: "guru",
      key: "guru",
    },
    {
      title: "Total Hafalan",
      dataIndex: ["hafalan", "total"],
      key: "totalHafalan",
      render: (value: number, record: any) =>
        renderTooltipTag(
          `Ziyadah: ${record.hafalan.ziyadah}, Murojaah: ${record.hafalan.murojaah}`,
          `${value} record`,
          "cyan"
        ),
    },
    {
      title: "Total Ayat",
      dataIndex: ["hafalan", "totalAyat"],
      key: "totalAyat",
      render: (value: number) => renderTagIcon(`${value} ayat`, "green"),
    },
    {
      title: "Kehadiran",
      dataIndex: ["absensi", "rate"],
      key: "attendanceRate",
      render: (value: number) => <Progress percent={Math.round(value)} size="small" />,
    },
    {
      title: "Target",
      dataIndex: ["target", "rate"],
      key: "targetRate",
      render: (value: number) => <Progress percent={Math.round(value)} size="small" />,
    },
    {
      title: "Prestasi",
      dataIndex: "prestasi",
      key: "prestasi",
      render: (value: number) => renderBadgeCount(value),
    },
    {
      title: "Nilai Akhir",
      dataIndex: "nilaiAkhir",
      key: "nilaiAkhir",
      render: (value: number) => renderNilai(value),
    },
    {
      title: "Status",
      dataIndex: "statusAkhir",
      key: "statusAkhir",
      render: (status: string) =>
        renderStatusBadge(status, {
          Hijau: "success",
          Kuning: "warning",
          Merah: "error",
        }),
    },
  ],
} as const;

export const getColumns = (reportType: string): ColumnsType<any> => {
  const builder = (reportTypeColumns as Record<string, () => any>)[reportType];
  return builder ? builder() : [];
};
