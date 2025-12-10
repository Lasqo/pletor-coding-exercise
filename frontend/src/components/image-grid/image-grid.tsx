import { Image, StagedImage } from '../../types/image'
import { ImageCard } from '../image-card/image-card'
import { DropZone } from '../drop-zone/drop-zone'
import { StagedImageCard } from '../staged-image-card/staged-image-card'

interface ImageGridProps {
  images: Image[]
  loading: boolean
  onDelete: (id: string) => void
  deletingId: string | null
  stagedImages: StagedImage[]
  onFilesAdded: (files: File[]) => void
  onUrlsAdded: (urls: string[]) => void
  onUpdateStaged: (id: string, data: Partial<StagedImage>) => void
  onRemoveStaged: (id: string) => void
  onUploadStaged: (id: string) => void
  validationError: string | null
  onClearValidationError: () => void
}

/**
 * Grid container for displaying drop zone, staged images, and existing images
 */
export function ImageGrid({
  images,
  loading,
  onDelete,
  deletingId,
  stagedImages,
  onFilesAdded,
  onUrlsAdded,
  onUpdateStaged,
  onRemoveStaged,
  onUploadStaged,
  validationError,
  onClearValidationError,
}: ImageGridProps) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Loading images...</p>
      </div>
    )
  }

  const totalCount = images.length + stagedImages.length

  return (
    <>
      <p style={{ color: '#666', marginBottom: 20 }}>
        {stagedImages.length > 0
          ? `${stagedImages.length} staged, ${images.length} uploaded`
          : `Showing ${images.length} images`}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {/* Drop Zone - always first */}
        <DropZone
          onFilesAdded={onFilesAdded}
          onUrlsAdded={onUrlsAdded}
          validationError={validationError}
          onClearError={onClearValidationError}
        />

        {/* Staged Images - after drop zone */}
        {stagedImages.map((stagedImage) => (
          <StagedImageCard
            key={stagedImage.id}
            image={stagedImage}
            onUpdate={onUpdateStaged}
            onRemove={onRemoveStaged}
            onUpload={onUploadStaged}
          />
        ))}

        {/* Existing Images - after staged */}
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={onDelete}
            isDeleting={deletingId === image.id}
          />
        ))}

        {/* Empty state - only show if no images and no staged */}
        {totalCount === 0 && (
          <p style={{ textAlign: 'center', gridColumn: '2/-1', color: '#666' }}>
            No images yet. Drop files or paste URLs above!
          </p>
        )}
      </div>
    </>
  )
}

