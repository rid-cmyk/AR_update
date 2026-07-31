"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function PWARegistrar() {
  usePWAInstall();
  return null;
}
