import React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  current: number
  total: number
  showPercentage?: boolean
  showFraction?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressIndicator({
  current,
  total,
  showPercentage = true,
  showFraction = false,
  className,
  size = 'md'
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        {showFraction && (
          <span className="text-sm text-muted-foreground">
            {current} dari {total}
          </span>
        )}
        {showPercentage && (
          <span className="text-sm font-medium">
            {percentage}%
          </span>
        )}
      </div>
      <Progress 
        value={percentage} 
        className={cn("w-full", sizeClasses[size])}
      />
    </div>
  )
}