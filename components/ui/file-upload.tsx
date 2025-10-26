"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  accept?: Record<string, string[]>
  maxSize?: number
  selectedFile?: File | null
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  selectedFile,
  className,
  disabled = false
}: FileUploadProps) {
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('')
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File terlalu besar. Maksimal 5MB.')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Tipe file tidak didukung. Gunakan PDF, DOC, atau DOCX.')
      } else {
        setError('File tidak valid.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {isDragActive
              ? "Lepaskan file di sini..."
              : "Drag & drop file atau klik untuk memilih"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOC, DOCX (Maks. 5MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {onFileRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}