import type React from 'react'
import { Upload } from 'lucide-react'
import { ACCEPTED_IMAGE_INPUT } from '../constants/image'

type DropZoneProps = {
  preview: string | null
  fileName: string | undefined
  isDragging: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const DropZone = ({
  preview,
  fileName,
  isDragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInputChange
}: DropZoneProps) => {
  return (
    <label
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      data-dragging={isDragging || undefined}
      className="relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 p-6 data-dragging:border-terracotta-400 data-dragging:bg-terracotta-500/5"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_INPUT}
        aria-label="Choose image file"
        onChange={onFileInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {preview ? (
        <div className="pointer-events-none">
          <img
            src={preview}
            alt={fileName ?? 'Preview of selected file'}
            className="max-h-44 max-w-full rounded-lg"
          />
          <p className="mt-3 text-sm text-cream-600">{fileName}</p>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center gap-2">
          <Upload size={24} className="text-cream-400" aria-hidden />
          <p className="text-sm text-cream-600">
            {isDragging
              ? 'Drop image here'
              : 'Drag & drop an image, or click to browse'}
          </p>
          <p className="text-xs text-cream-600">JPEG, PNG, GIF, WebP</p>
        </div>
      )}
    </label>
  )
}

export { DropZone }
