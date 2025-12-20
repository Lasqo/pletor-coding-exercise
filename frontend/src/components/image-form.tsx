import { useState, useCallback } from 'react';

type ImageFormData = {
  title: string;
  created_by: string;
  users_access: string;
  url: string;
};

type ImageFormProps = {
  onSubmit: (data: ImageFormData) => Promise<void>;
};

const USER_NAME = 'me';

export const ImageForm = ({ onSubmit }: ImageFormProps) => {
  const [form, setForm] = useState<Pick<ImageFormData, 'title' | 'users_access' | 'url'>>({
    title: '',
    users_access: '',
    url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit({
          title: form.title,
          created_by: USER_NAME,
          users_access: form.users_access,
          url: form.url,
        });
        setForm({ title: '', users_access: '', url: '' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#fff',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 4px 24px #0002',
        marginBottom: 40,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div>
        <label style={{ fontWeight: 500, color: '#333' }}>
          Title
          <br />
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-input"
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #bbb',
              minWidth: 120,
              height: 32,
              outline: 'none',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            }}
          />
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 500, color: '#333' }}>
          Users access
          <br />
          <select
            name="users_access"
            value={form.users_access}
            onChange={handleChange}
            required
            className="form-input"
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #bbb',
              minWidth: 120,
              height: 40,
              outline: 'none',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            }}
          >
            <option value="">Select...</option>
            <option value="me">me</option>
            <option value="everybody">everybody</option>
            <option value="group1">Group 1</option>
            <option value="group2">Group 2</option>
          </select>
        </label>
      </div>
      <div>
        <label style={{ fontWeight: 500, color: '#333' }}>
          Image URL
          <br />
          <input
            name="url"
            value={form.url}
            onChange={handleChange}
            required
            className="form-input"
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #bbb',
              minWidth: 220,
              height: 32,
              outline: 'none',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            }}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
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
          transition: 'background 0.2s',
          height: 40,
        }}
      >
        {isSubmitting ? 'Uploading...' : 'Add Image'}
      </button>
    </form>
  );
};
