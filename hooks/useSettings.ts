"use client"

import { useEffect, useState, useCallback } from "react"
import { message } from "antd"

export interface SystemSettings {
  appName: string
  appDescription: string
  contactEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  maxUsers: number
  sessionTimeout: number
  backupEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackupHour: number
  maxFileSize: number
  allowedFileTypes: string[]
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalUjian: number
  totalRaport: number
  dbSize: string
  lastBackup: string
  systemUptime: string
  memoryUsage: number
  diskUsage: number
  cpuUsage: number
}

const defaultSettings: SystemSettings = {
  appName: "AR-Hafalan",
  appDescription: "Sistem Manajemen Hafalan Al-Quran Terpadu",
  contactEmail: "admin@arhafalan.com",
  maintenanceMode: false,
  allowRegistration: true,
  maxUsers: 1000,
  sessionTimeout: 30,
  backupEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  autoBackupHour: 2,
  maxFileSize: 10,
  allowedFileTypes: ["pdf", "doc", "docx", "jpg", "png"],
}

const defaultStats: SystemStats = {
  totalUsers: 342,
  activeUsers: 89,
  totalUjian: 1250,
  totalRaport: 340,
  dbSize: "2.4 GB",
  lastBackup: "2 jam yang lalu",
  systemUptime: "15 hari 4 jam",
  memoryUsage: 68,
  diskUsage: 45,
  cpuUsage: 23,
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [stats, setStats] = useState<SystemStats>(defaultStats)
  const [loading, setLoading] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings) setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings?stats=true")
      if (res.ok) {
        const data = await res.json()
        if (data.stats) setStats(data.stats)
        if (data.settings) setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [])

  const saveSettings = useCallback(async (newSettings?: Partial<SystemSettings>) => {
    setLoading(true)
    try {
      const payload = { ...settings, ...newSettings }
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSettings(payload)
        message.success("Pengaturan berhasil disimpan!")
      } else {
        throw new Error("Failed to save")
      }
    } catch {
      message.error("Gagal menyimpan pengaturan")
    } finally {
      setLoading(false)
    }
  }, [settings])

  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [fetchSettings, fetchStats])

  return { settings, setSettings, stats, loading, saveSettings, fetchStats }
}
