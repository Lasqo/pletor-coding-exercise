import { ImageFormData } from '../../types/image'

interface ImageFormProps {
  form: ImageFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
}

const INPUT_STYLE = {
  padding: 10,
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
} as const

const LABEL_STYLE = {
  fontWeight: 500,
  color: '#333',
  display: 'block',
  marginBottom: 4,
} as const

/**
 * Form component for adding new images
 */
export function ImageForm({ form, onChange, onSubmit, isSubmitting }: ImageFormProps) {
  return (
    <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 12, marginBottom: 40 }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>Add New Image</h2>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}
      >
        <div>
          <label style={LABEL_STYLE}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            style={{ ...INPUT_STYLE, minWidth: 150 }}
            placeholder="Enter title"
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>User</label>
          <input
            name="user"
            value={form.user}
            onChange={onChange}
            required
            style={{ ...INPUT_STYLE, minWidth: 150 }}
            placeholder="Your name"
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={LABEL_STYLE}>Image URL</label>
          <input
            name="url"
            value={form.url}
            onChange={onChange}
            required
            style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 24px',
            borderRadius: 6,
            background: isSubmitting ? '#999' : '#222',
            color: 'white',
            fontWeight: 600,
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: 14,
            height: 42,
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add Image'}
        </button>
      </form>
    </div>
  )
}
