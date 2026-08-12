import React, { ReactNode } from "react";
import { Tag, Progress, Badge, Tooltip } from "antd";
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export function sortByString(key: string) {
  return (a: any, b: any) =>
    String(a?.[key] ?? "").localeCompare(String(b?.[key] ?? ""));
}

export function sortByNumber(key: string) {
  return (a: any, b: any) =>
    (Number(a?.[key]) || 0) - (Number(b?.[key]) || 0);
}

export function renderBold(text: ReactNode) {
  return <strong>{text}</strong>;
}

export function renderTagIcon(text: ReactNode, color: string, icon?: ReactNode) {
  return <Tag icon={icon} color={color}>{text}</Tag>;
}

export function renderBadgeCount(value: number, color?: string) {
  return color ? (
    <Badge count={value} showZero color={color} />
  ) : (
    <Badge count={value} showZero />
  );
}

export function progressStatus(value: number, success: number, normal: number) {
  if (value >= success) return "success" as const;
  if (value >= normal) return "normal" as const;
  return "exception" as const;
}

interface ProgressOpts {
  success?: number;
  normal?: number;
  format?: (percent?: number) => string;
}

export function renderProgress(value: number, opts?: ProgressOpts) {
  const success = opts?.success ?? 80;
  const normal = opts?.normal ?? 60;
  return (
    <Progress
      percent={value}
      size="small"
      status={progressStatus(value, success, normal)}
      format={opts?.format}
    />
  );
}

export function renderNilai(value: number, fractionDigits = 0) {
  return (
    <Tag color={value >= 80 ? "green" : value >= 60 ? "orange" : "red"}>
      {fractionDigits ? value.toFixed(fractionDigits) : value}
    </Tag>
  );
}

export function renderDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY");
}

export function renderDateOrNone(date: string | null) {
  return date ? (
    <Tag color="green">{dayjs(date).format("DD/MM/YYYY")}</Tag>
  ) : (
    <Tag color="red" icon={<ExclamationCircleOutlined />}>Tidak ada</Tag>
  );
}

export function renderDeadline(date: string) {
  const isOverdue = dayjs(date).isBefore(dayjs());
  return (
    <Tag color={isOverdue ? "red" : "blue"}>
      {dayjs(date).format("DD/MM/YYYY")}
    </Tag>
  );
}

export function renderStatusTag(status: string, colors: Record<string, string>) {
  return <Tag color={colors[status] ?? "default"}>{status}</Tag>;
}

export type BadgeStatus = "success" | "warning" | "error" | "default" | "processing";

export function renderStatusBadge(status: string, colors: Record<string, BadgeStatus>) {
  return <Badge status={colors[status] ?? "default"} text={status} />;
}

export function renderTooltipTag(tooltip: string, text: ReactNode, color: string) {
  return (
    <Tooltip title={tooltip}>
      <Tag color={color}>{text}</Tag>
    </Tooltip>
  );
}

export const icons = {
  user: <UserOutlined />,
  book: <BookOutlined />,
  trophy: <TrophyOutlined />,
  clock: <ClockCircleOutlined />,
  team: <TeamOutlined />,
  check: <CheckCircleOutlined />,
};
