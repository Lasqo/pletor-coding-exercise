import './App.css'
import { useImages } from './hooks/use-images'
import { useStagedImages } from './hooks/use-staged-images'
import { ImageGrid } from './components/image-grid/image-grid'

function App() {
  const { images, loading, deleting, refreshImages, handleDelete } = useImages()

  const {
    stagedImages,
    addFiles,
    addUrls,
    updateStaged,
    removeStaged,
    uploadStaged,
    validationError,
    clearValidationError,
  } = useStagedImages(refreshImages)

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '2rem auto',
        fontFamily: 'Inter, sans-serif',
        padding: '0 20px',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          fontSize: '3rem',
          fontWeight: 700,
          marginBottom: 40,
          letterSpacing: '-2px',
          color: '#222',
        }}
      >
        Image Gallery
      </h1>

      <ImageGrid
        images={images}
        loading={loading}
        onDelete={handleDelete}
        deletingId={deleting}
        stagedImages={stagedImages}
        onFilesAdded={addFiles}
        onUrlsAdded={addUrls}
        onUpdateStaged={updateStaged}
        onRemoveStaged={removeStaged}
        onUploadStaged={uploadStaged}
        validationError={validationError}
        onClearValidationError={clearValidationError}
      />
    </div>
  )
}

export default App
