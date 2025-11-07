'use client'

import { useState } from 'react'
import { FormUjianWizard } from './FormUjianWizard'
import { FormPenilaianUjian } from './FormPenilaianUjianNew'

interface UjianManagerProps {
  onComplete?: () => void
}

export function UjianManager({ onComplete }: UjianManagerProps) {
  const [currentView, setCurrentView] = useState<'wizard' | 'form'>('wizard')
  const [ujianData, setUjianData] = useState<any>(null)

  const handleWizardComplete = (data: any) => {
    setUjianData(data)
    setCurrentView('form')
  }

  const handleFormBack = () => {
    setCurrentView('wizard')
  }

  const handleFormComplete = () => {
    setCurrentView('wizard')
    setUjianData(null)
    onComplete?.()
  }

  const handleCancel = () => {
    setCurrentView('wizard')
    setUjianData(null)
    onComplete?.()
  }

  if (currentView === 'wizard') {
    return (
      <FormUjianWizard 
        onComplete={handleWizardComplete}
        onCancel={handleCancel}
      />
    )
  }

  if (currentView === 'form' && ujianData) {
    return (
      <FormPenilaianUjian 
        ujianData={ujianData}
        onBack={handleFormBack}
        onComplete={handleFormComplete}
      />
    )
  }

  return null
}