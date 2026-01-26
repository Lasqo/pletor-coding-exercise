import { useState, useRef } from 'react'
import { useUploadImage, useUploadImagesBatch } from '../hooks/useImages'
import { ErrorMessage } from './ErrorMessage'
import './UploadZone.css'

export function UploadZone() {
  const [preview, setPreview] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadSingle = useUploadImage()
  const uploadBatch = useUploadImagesBatch()

  const resetUploadState = () => {
    setPreview([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadSuccess = () => {
    resetUploadState()
  }

  const handleUploadError = (error: Error) => {
    setError(`Upload failed: ${error.message}`)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setError('Please select image files (JPEG, PNG, GIF, or WebP)')
      return
    }

    setError(null)

    const previewPromises = imageFiles.map(
      file =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )

    try {
      const previews = await Promise.all(previewPromises)
      setPreview(previews)

      if (imageFiles.length === 1) {
        uploadSingle.mutate(imageFiles[0], {
          onSuccess: handleUploadSuccess,
          onError: handleUploadError,
        })
      } else {
        uploadBatch.mutate(imageFiles, {
          onSuccess: handleUploadSuccess,
          onError: handleUploadError,
        })
      }
    } catch {
      setError('Failed to load image previews')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const clearPreview = () => {
    resetUploadState()
  }

  const isUploading = uploadSingle.isPending || uploadBatch.isPending

  return (
    <div className="upload-zone-container">
      <h2>Add New Images</h2>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="upload-zone-input"
          aria-label="Select image files to upload"
        />
        {preview.length === 0 ? (
          <>
            <p className="upload-zone-text">
              {isDragging ? 'Drop images here' : 'Drag & drop images here, or click to select'}
            </p>
            <p className="upload-zone-hint">
              Supports: JPEG, PNG, GIF, WebP (multiple files supported)
            </p>
          </>
        ) : (
          <div className="upload-zone-preview">
            {preview.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                className="upload-zone-preview-img"
              />
            ))}
            <p className="upload-zone-preview-count">
              {preview.length} file{preview.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {preview.length > 0 && (
        <button type="button" onClick={clearPreview} className="upload-zone-clear-btn">
          Clear selection
        </button>
      )}

      {isUploading && (
        <div className="upload-zone-status" role="status" aria-live="polite">
          <p>Uploading{preview.length > 1 ? ` ${preview.length} files` : ''}...</p>
        </div>
      )}

      {(uploadSingle.isSuccess || uploadBatch.isSuccess) && (
        <div className="upload-zone-success" role="status" aria-live="polite">
          Image{preview.length > 1 ? 's' : ''} uploaded successfully!
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      {(uploadSingle.isError || uploadBatch.isError) && !error && (
        <ErrorMessage
          message={uploadSingle.error?.message || uploadBatch.error?.message || 'Upload failed'}
          onDismiss={() => {
            uploadSingle.reset()
            uploadBatch.reset()
          }}
        />
      )}
    </div>
  )
}
