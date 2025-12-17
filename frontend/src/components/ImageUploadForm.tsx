import { ImageFormData } from '../types'

interface ImageUploadFormProps {
  form: ImageFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
}

export const ImageUploadForm = ({ form, onChange, onSubmit, submitting }: ImageUploadFormProps) => {
  return (
    <form 
      onSubmit={onSubmit} 
      style={{ 
        marginBottom: 40, 
        display: 'flex', 
        gap: 16, 
        flexWrap: 'wrap', 
        alignItems: 'flex-end', 
        justifyContent: 'center' 
      }}
    >
      <div>
        <label style={{ fontWeight: 500, color: '#333' }}>
          Title<br />
          <input 
            name="title" 
            value={form.title} 
            onChange={onChange} 
            required 
            style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 120 }} 
          />
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 500, color: '#333' }}>
          Image URL<br />
          <input 
            name="url" 
            value={form.url} 
            onChange={onChange} 
            required 
            style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 220 }} 
          />
        </label>
      </div>
      <button 
        type="submit" 
        disabled={submitting} 
        style={{ 
          padding: '10px 22px', 
          borderRadius: 6, 
          background: '#222', 
          color: 'white', 
          fontWeight: 600, 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: 16, 
          boxShadow: '0 2px 8px #0001', 
          transition: 'background 0.2s' 
        }}
      >
        Add Image
      </button>
    </form>
  )
}
