"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MultiStepFormProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrevious?: () => void
  onSubmit?: () => void
  isNextDisabled?: boolean
  isSubmitting?: boolean
  className?: string
}

export function MultiStepForm({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
  className
}: MultiStepFormProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                i + 1 < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i + 1 === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          Langkah {currentStep} dari {totalSteps}
        </span>
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? "Menyimpan..." : "Selesai"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center gap-2"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}