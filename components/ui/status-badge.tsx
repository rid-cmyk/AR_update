import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'draft' | 'published'
  className?: string
}

const statusConfig = {
  active: {
    label: 'Aktif',
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  inactive: {
    label: 'Tidak Aktif',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  },
  pending: {
    label: 'Menunggu',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  },
  completed: {
    label: 'Selesai',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  draft: {
    label: 'Draft',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
  },
  published: {
    label: 'Dipublikasi',
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}