import { API_URL, QUOTA_URL } from '../config'
import { useEffect, useState } from 'react'

import { Quota } from '../types'

interface SubmissionFormProps {
  token: string
  onSuccess: () => void
  onError: (error: Error | null) => void
  onLogout: () => void
  error: Error | null
}

export default function SubmissionForm({ token, onSuccess, onError, onLogout, error }: SubmissionFormProps) {
  const [form, setForm] = useState({ title: '', user: '', url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [quota, setQuota] = useState<Quota | null>(null)

  const fetchQuota = async () => {
    try {
      const res = await fetch(QUOTA_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
        if (data.user) {
            setForm(f => ({ ...f, user: data.user }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch quota', error)
    }
  }

  useEffect(() => {
      if (token) {
          fetchQuota()
      }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      const payload = {
          title: form.title,
          url: form.url
      }
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        let errorMessage = 'Failed to add image'
        try {
          const errorData = await res.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch {
          if (res.status === 429) {
            errorMessage = 'Daily upload limit exceeded'
          }
        }
        throw new Error(errorMessage)
      }

      await fetchQuota()
      setForm(f => ({ ...f, title: '', url: '' }))
      onSuccess()
    } catch (err: any) {
      onError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ width: 300, flexShrink: 0, padding: '2rem', borderRight: '1px solid #eee', background: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'left', fontSize: '2rem', fontWeight: 700, marginBottom: 32, letterSpacing: '-1px', color: '#222' }}>Image Gallery</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>User</label>
          <input 
            name="user" 
            value={form.user} 
            readOnly 
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ccc', background: '#f0f0f0', color: '#555', cursor: 'not-allowed' }} 
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>Image URL</label>
          <input name="url" value={form.url} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        {quota && <p style={{ fontSize: 13, color: '#666', marginTop: 6, fontWeight: 500 }}>Daily Quota: {quota.usage}/{quota.limit}</p>}
        <button type="submit" disabled={submitting} style={{ padding: '12px', marginTop: 8, borderRadius: 6, background: '#222', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, transition: 'opacity 0.2s', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Adding...' : 'Add Image'}
        </button>
      </form>
      {error && <div style={{ marginTop: 20, padding: 12, borderRadius: 6, background: '#fee2e2', color: '#c0392b', fontSize: 14 }}>{error.message}</div>}
      <button onClick={onLogout} style={{ width: '100%', marginTop: '2rem', padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Logout</button>
    </div>
  )
}
