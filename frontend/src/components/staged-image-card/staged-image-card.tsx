import { useCallback } from 'react'
import { StagedImage } from '../../types/image'

interface StagedImageCardProps {
  image: StagedImage
  onUpdate: (id: string, data: Partial<StagedImage>) => void
  onRemove: (id: string) => void
  onUpload: (id: string) => void
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=Image+Preview'

/**
 * Card component for staged images with editable fields and upload action
 */
export function StagedImageCard({ image, onUpdate, onRemove, onUpload }: StagedImageCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE
  }

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(image.id, { title: e.target.value })
    },
    [image.id, onUpdate]
  )

  const handleUserChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(image.id, { user: e.target.value })
    },
    [image.id, onUpdate]
  )

  const handleUpload = useCallback(() => {
    onUpload(image.id)
  }, [image.id, onUpload])

  const handleRemove = useCallback(() => {
    onRemove(image.id)
  }, [image.id, onRemove])

  const isUploading = image.status === 'uploading'
  const isSuccess = image.status === 'success'
  const isError = image.status === 'error'
  const canUpload = image.title.trim() !== '' && image.user.trim() !== '' && !isUploading

  return (
    <div
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
        border: isSuccess
          ? '2px solid #4caf50'
          : isError
            ? '2px solid #f44336'
            : '2px solid #2196f3',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Remove button */}
      {!isUploading && !isSuccess && (
        <button
          onClick={handleRemove}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            aspectRatio: '1/1',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          title="Remove"
        >
          ×
        </button>
      )}

      {/* Loading overlay */}
      {isUploading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#2196f3',
            }}
          >
            Uploading...
          </div>
        </div>
      )}

      {/* Success overlay */}
      {isSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(76, 175, 80, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'white',
            }}
          >
            ✓ Uploaded!
          </div>
        </div>
      )}

      {/* Image preview */}
      <div style={{ position: 'relative', paddingTop: '66.67%', background: '#f0f0f0' }}>
        <img
          src={image.url}
          alt={image.title || 'Preview'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={handleImageError}
        />
        {/* Staged badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: '#2196f3',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {image.source === 'file' ? 'File' : 'URL'}
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          value={image.title}
          onChange={handleTitleChange}
          placeholder="Enter title..."
          disabled={isUploading || isSuccess}
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 14,
            fontWeight: 600,
          }}
        />
        <input
          type="text"
          value={image.user}
          onChange={handleUserChange}
          placeholder="Your name..."
          disabled={isUploading || isSuccess}
          style={{
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 14,
          }}
        />

        {/* Error message */}
        {isError && image.error && (
          <div
            style={{
              padding: 10,
              background: '#ffebee',
              color: '#c62828',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {image.error}
          </div>
        )}

        {/* Upload / Retry button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            style={{
              background: !canUpload
                ? '#ccc'
                : isError
                  ? '#ff9800'
                  : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              cursor: !canUpload ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              width: '100%',
            }}
          >
            {isError ? 'Retry Upload' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

