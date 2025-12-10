import './App.css'
import { useImages } from './hooks/use-images'
import { ImageForm } from './components/image-form/image-form'
import { ImageGrid } from './components/image-grid/image-grid'
import { StatusMessage } from './components/status-message/status-message'

function App() {
  const {
    images,
    loading,
    error,
    form,
    submitting,
    deleting,
    showSuccess,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useImages()

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

      <ImageForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />

      <StatusMessage type="success" message="Image added successfully!" visible={showSuccess} />

      <StatusMessage
        type="error"
        message={error ? `Error: ${error.message}` : ''}
        visible={!!error}
      />

      <ImageGrid
        images={images}
        loading={loading}
        onDelete={handleDelete}
        deletingId={deleting}
      />
    </div>
  )
}

export default App
