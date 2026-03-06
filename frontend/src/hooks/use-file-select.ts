import React from 'react'
import { matchIsImageFile, readFileAsDataUrl } from '../helpers/file'

const useFileSelect = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const selectFile = (file: File) => {
    setSelectedFile(file)
    void readFileAsDataUrl(file).then((dataUrl) => {
      setPreview(dataUrl)
    })
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]

    if (file && matchIsImageFile(file)) {
      selectFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (file) {
      selectFile(file)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return {
    selectedFile,
    preview,
    isDragging,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInputChange,
    clearSelection
  }
}

export { useFileSelect }
