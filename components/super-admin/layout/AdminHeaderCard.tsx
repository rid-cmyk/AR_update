'use client'

import { ReactNode } from 'react'
import { SettingOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { DashboardHeader } from '@/components/ui/dashboard-header'

interface AdminHeaderCardProps {
  title: string
  subtitle: string
  tags?: Array<{ label: string; icon?: ReactNode; color?: string }>
  actions?: ReactNode
}

export default function AdminHeaderCard({ title, subtitle, tags, actions }: AdminHeaderCardProps) {
  const resolvedTags = tags || [
    { label: 'Admin Panel', icon: <SettingOutlined /> },
    { label: 'Online', icon: <ClockCircleOutlined /> }
  ]

  const badge = (
    <span className="inline-flex items-center gap-2 flex-wrap">
      {resolvedTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
        >
          {tag.icon}
          {tag.label}
        </span>
      ))}
    </span>
  )

  return (
    <DashboardHeader badge={badge} title={title} subtitle={subtitle} className="mb-8">
      {actions}
    </DashboardHeader>
  )
}
