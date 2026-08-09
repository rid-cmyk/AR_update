import { Tag, Progress, Badge, Tooltip } from "antd";
import { UserOutlined, BookOutlined, TrophyOutlined, ClockCircleOutlined, TeamOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import React from "react";

export const getColumns = (reportType: string) => {
  switch (reportType) {
    case 'halaqah':
      return [
        {
          title: "Halaqah",
          dataIndex: "namaHalaqah",
          key: "namaHalaqah",
          render: (text: string) => <strong>{text}</strong>,
          sorter: (a: any, b: any) => a.namaHalaqah.localeCompare(b.namaHalaqah),
        },
        {
          title: "Guru Pembimbing",
          dataIndex: "namaGuru",
          key: "namaGuru",
          render: (text: string) => (
            <Tag icon={<UserOutlined />} color="blue">{text}</Tag>
          ),
        },
        {
          title: "Santri",
          dataIndex: "totalSantri",
          key: "totalSantri",
          render: (value: number) => (
            <Badge count={value} showZero color="#219ebc" />
          ),
          sorter: (a: any, b: any) => a.totalSantri - b.totalSantri,
        },
        {
          title: "Total Hafalan",
          dataIndex: "totalHafalan",
          key: "totalHafalan",
          render: (value: number) => (
            <Tag icon={<BookOutlined />} color="cyan">{value} record</Tag>
          ),
          sorter: (a: any, b: any) => a.totalHafalan - b.totalHafalan,
        },
        {
          title: "Total Ujian",
          dataIndex: "totalUjian",
          key: "totalUjian",
          render: (value: number) => (
            <Tag icon={<TrophyOutlined />} color="orange">{value} ujian</Tag>
          ),
          sorter: (a: any, b: any) => a.totalUjian - b.totalUjian,
        },
        {
          title: "Attendance Rate",
          dataIndex: "attendanceRate",
          key: "attendanceRate",
          render: (value: number) => (
            <Progress
              percent={value}
              size="small"
              status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
              format={(percent) => `${percent}%`}
            />
          ),
          sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
        },
        {
          title: "Hafalan Rate",
          dataIndex: "hafalanRate",
          key: "hafalanRate",
          render: (value: number) => (
            <Progress
              percent={value}
              size="small"
              status={value >= 75 ? "success" : value >= 50 ? "normal" : "exception"}
              format={(percent) => `${percent}%`}
            />
          ),
          sorter: (a: any, b: any) => a.hafalanRate - b.hafalanRate,
        },
      ];

    case 'santri':
      return [
        {
          title: "Nama Santri",
          dataIndex: "namaLengkap",
          key: "namaLengkap",
          render: (text: string) => <strong>{text}</strong>,
          sorter: (a: any, b: any) => a.namaLengkap.localeCompare(b.namaLengkap),
        },
        {
          title: "Halaqah",
          dataIndex: "halaqah",
          key: "halaqah",
          render: (text: string) => <Tag color="green">{text}</Tag>,
        },
        {
          title: "Total Hafalan",
          dataIndex: "totalHafalan",
          key: "totalHafalan",
          render: (value: number) => (
            <Tag icon={<BookOutlined />} color="blue">{value} record</Tag>
          ),
          sorter: (a: any, b: any) => a.totalHafalan - b.totalHafalan,
        },
        {
          title: "Total Ujian",
          dataIndex: "totalUjian",
          key: "totalUjian",
          render: (value: number) => (
            <Tag icon={<TrophyOutlined />} color="orange">{value} ujian</Tag>
          ),
          sorter: (a: any, b: any) => a.totalUjian - b.totalUjian,
        },
        {
          title: "Target Aktif",
          dataIndex: "targetAktif",
          key: "targetAktif",
          render: (value: number) => (
            <Tag icon={<ClockCircleOutlined />} color="purple">{value} target</Tag>
          ),
          sorter: (a: any, b: any) => a.targetAktif - b.targetAktif,
        },
        {
          title: "Attendance Rate",
          dataIndex: "attendanceRate",
          key: "attendanceRate",
          render: (value: number) => (
            <Progress
              percent={value}
              size="small"
              status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
            />
          ),
          sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
        },
        {
          title: "Last Activity",
          dataIndex: "lastActivity",
          key: "lastActivity",
          render: (date: string | null) =>
            date ? (
              <Tag color="green">{dayjs(date).format("DD/MM/YYYY")}</Tag>
            ) : (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>Tidak ada</Tag>
            )
        },
      ];

    case 'guru':
      return [
        {
          title: "Nama Guru",
          dataIndex: "namaLengkap",
          key: "namaLengkap",
          render: (text: string) => <strong>{text}</strong>,
          sorter: (a: any, b: any) => a.namaLengkap.localeCompare(b.namaLengkap),
        },
        {
          title: "Halaqah",
          dataIndex: "halaqahCount",
          key: "halaqahCount",
          render: (value: number) => (
            <Tag icon={<TeamOutlined />} color="blue">{value} halaqah</Tag>
          ),
          sorter: (a: any, b: any) => a.halaqahCount - b.halaqahCount,
        },
        {
          title: "Total Santri",
          dataIndex: "totalSantri",
          key: "totalSantri",
          render: (value: number) => (
            <Badge count={value} showZero color="#219ebc" />
          ),
          sorter: (a: any, b: any) => a.totalSantri - b.totalSantri,
        },
        {
          title: "Permission",
          dataIndex: "permissionCount",
          key: "permissionCount",
          render: (value: number) => (
            <Tag icon={<CheckCircleOutlined />} color="green">{value} akses</Tag>
          ),
          sorter: (a: any, b: any) => a.permissionCount - b.permissionCount,
        },
        {
          title: "Avg Attendance",
          dataIndex: "averageAttendance",
          key: "averageAttendance",
          render: (value: number) => (
            <Progress
              percent={value}
              size="small"
              status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
            />
          ),
          sorter: (a: any, b: any) => a.averageAttendance - b.averageAttendance,
        },
      ];

    case 'ujian':
      return [
        {
          title: "Santri",
          dataIndex: "santri",
          key: "santri",
          render: (text: string) => <strong>{text}</strong>,
        },
        {
          title: "Halaqah",
          dataIndex: "halaqah",
          key: "halaqah",
          render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
          title: "Jenis Ujian",
          dataIndex: "jenisUjian",
          key: "jenisUjian",
          render: (text: string) => <Tag color="purple">{text.toUpperCase()}</Tag>,
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
          render: (value: number) => (
            <Tag color={value >= 80 ? "green" : value >= 60 ? "orange" : "red"}>
              {value.toFixed(1)}
            </Tag>
          ),
          sorter: (a: any, b: any) => a.nilaiAkhir - b.nilaiAkhir,
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => {
            const colors = {
              draft: "default",
              submitted: "processing",
              verified: "success",
              rejected: "error"
            };
            return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
          },
        },
        {
          title: "Tanggal",
          dataIndex: "tanggal",
          key: "tanggal",
          render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
          title: "Verifier",
          dataIndex: "verifier",
          key: "verifier",
        },
      ];

    case 'target':
      return [
        {
          title: "Santri",
          dataIndex: "santri",
          key: "santri",
          render: (text: string) => <strong>{text}</strong>,
        },
        {
          title: "Halaqah",
          dataIndex: "halaqah",
          key: "halaqah",
          render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
          title: "Surat",
          dataIndex: "surat",
          key: "surat",
          render: (text: string) => <Tag color="green">{text}</Tag>,
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
          render: (date: string) => {
            const isOverdue = dayjs(date).isBefore(dayjs());
            return (
              <Tag color={isOverdue ? "red" : "blue"}>
                {dayjs(date).format("DD/MM/YYYY")}
              </Tag>
            );
          },
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => {
            const colors = {
              belum: "default",
              proses: "processing",
              selesai: "success"
            };
            return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
          },
        },
        {
          title: "Progress",
          dataIndex: "progress",
          key: "progress",
          render: (value: number) => (
            <Progress percent={value} size="small" />
          ),
        },
      ];

    case 'tahfidz':
      return [
        {
          title: "Nama Santri",
          dataIndex: "namaSantri",
          key: "namaSantri",
          render: (text: string) => <strong>{text}</strong>,
        },
        {
          title: "Halaqah",
          dataIndex: "halaqah",
          key: "halaqah",
          render: (text: string) => <Tag color="blue">{text}</Tag>,
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
          render: (value: number, record: any) => (
            <Tooltip title={`Ziyadah: ${record.hafalan.ziyadah}, Murojaah: ${record.hafalan.murojaah}`}>
              <Tag color="cyan">{value} record</Tag>
            </Tooltip>
          ),
        },
        {
          title: "Total Ayat",
          dataIndex: ["hafalan", "totalAyat"],
          key: "totalAyat",
          render: (value: number) => <Tag color="green">{value} ayat</Tag>,
        },
        {
          title: "Kehadiran",
          dataIndex: ["absensi", "rate"],
          key: "attendanceRate",
          render: (value: number) => (
            <Progress percent={Math.round(value)} size="small" />
          ),
        },
        {
          title: "Target",
          dataIndex: ["target", "rate"],
          key: "targetRate",
          render: (value: number) => (
            <Progress percent={Math.round(value)} size="small" />
          ),
        },
        {
          title: "Prestasi",
          dataIndex: "prestasi",
          key: "prestasi",
          render: (value: number) => <Badge count={value} showZero />,
        },
        {
          title: "Nilai Akhir",
          dataIndex: "nilaiAkhir",
          key: "nilaiAkhir",
          render: (value: number) => (
            <Tag color={value >= 80 ? "green" : value >= 60 ? "orange" : "red"}>
              {value}
            </Tag>
          ),
        },
        {
          title: "Status",
          dataIndex: "statusAkhir",
          key: "statusAkhir",
          render: (status: string) => {
            const colors: Record<string, "success" | "warning" | "error" | "default" | "processing"> = {
              Hijau: "success",
              Kuning: "warning",
              Merah: "error"
            };
            return <Badge status={colors[status] || "default"} text={status} />;
          },
        },
      ];

    default:
      return [];
  }
};
