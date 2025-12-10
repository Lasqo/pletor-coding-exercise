import { useState, useRef, useCallback } from 'react'

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  onUrlsAdded: (urls: string[]) => void
  validationError: string | null
  onClearError: () => void
}

/**
 * Drop zone component for adding images via drag/drop, file picker, or URL paste
 * TODO: use a library like react-dropzone for better UX
 */
export function DropZone({
  onFilesAdded,
  onUrlsAdded,
  validationError,
  onClearError,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      onClearError()

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFilesAdded(files)
      }
    },
    [onFilesAdded, onClearError]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onClearError()
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length > 0) {
        onFilesAdded(files)
      }
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [onFilesAdded, onClearError]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUrlInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUrlInput(e.target.value)
      onClearError()
    },
    [onClearError]
  )

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onUrlsAdded([urlInput])
      setUrlInput('')
    }
  }, [urlInput, onUrlsAdded])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleUrlSubmit()
      }
    },
    [handleUrlSubmit]
  )

  return (
    <div
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 12,
        background: isDragOver ? '#e3f2fd' : '#fafafa',
        border: isDragOver ? '2px dashed #2196f3' : '2px dashed #ccc',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
        transition: 'all 0.2s ease',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Clickable drop area */}
      <div
        onClick={handleClick}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          cursor: 'pointer',
          minHeight: 120,
        }}
      >
        <div
          style={{
            fontSize: 40,
            marginBottom: 12,
            color: isDragOver ? '#2196f3' : '#999',
          }}
        >
          {isDragOver ? '📥' : '🖼️'}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: isDragOver ? '#2196f3' : '#666',
            textAlign: 'center',
          }}
        >
          {isDragOver ? 'Drop images here' : 'Drop images or click to browse'}
        </p>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
          }}
        >
          JPEG, PNG, GIF, WebP
        </p>
      </div>

      {/* URL input area */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <div
          style={{
            borderTop: '1px solid #eee',
            paddingTop: 12,
          }}
        >
          {/* TODO: parse urls from input and display them as a list */}
          <textarea
            value={urlInput}
            onChange={handleUrlInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Or paste image URL(s) here..."
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 12,
              resize: 'none',
              boxSizing: 'border-box',
              minHeight: 60,
              fontFamily: 'inherit',
            }}
          />
          {urlInput.trim() && (
            <button
              onClick={handleUrlSubmit}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '8px 16px',
                borderRadius: 6,
                background: '#222',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Add URL(s)
            </button>
          )}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          style={{
            padding: '10px 16px',
            background: '#ffebee',
            color: '#c62828',
            fontSize: 12,
            borderRadius: '0 0 10px 10px',
          }}
        >
          {validationError}
        </div>
      )}
    </div>
  )
}

