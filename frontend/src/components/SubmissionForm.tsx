import { useState } from 'react'
import { Quota } from '../types'
import { API_URL, QUOTA_URL } from '../config'

interface SubmissionFormProps {
  onSuccess: () => void
  onError: (error: Error | null) => void
  error: Error | null
}

export default function SubmissionForm({ onSuccess, onError, error }: SubmissionFormProps) {
  const [form, setForm] = useState({ title: '', user: '', url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [quota, setQuota] = useState<Quota | null>(null)

  const fetchQuota = async (user: string) => {
    if (!user) {
      setQuota(null)
      return
    }
    try {
      const res = await fetch(`${QUOTA_URL}${user}`)
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch (error) {
      console.error('Failed to fetch quota', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Daily upload limit of 5 exceeded')
        }
        throw new Error('Failed to add image')
      }

      await fetchQuota(form.user)
      setForm({ title: '', user: '', url: '' })
      onSuccess()
    } catch (err: any) {
      onError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ width: '320px', padding: '2rem', borderRight: '1px solid var(--border-color)', background: 'var(--sidebar-bg)' }}>
      <h1 style={{ textAlign: 'left', fontSize: '2rem', fontWeight: 700, marginBottom: 32, letterSpacing: '-1px', color: 'var(--text-primary)' }}>Image Gallery</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>User</label>
          <input name="user" value={form.user} onChange={handleChange} onBlur={() => fetchQuota(form.user)} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }} />
          {quota && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>Daily Quota: {quota.usage}/{quota.limit}</p>}
        </div>
        <div>
          <label style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Image URL</label>
          <input name="url" value={form.url} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }} />
        </div>
        <button type="submit" disabled={submitting} style={{ padding: '12px', marginTop: 8, borderRadius: 6, background: 'var(--button-bg)', color: 'var(--button-text)', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, transition: 'opacity 0.2s', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Adding...' : 'Add Image'}
        </button>
      </form>
      {error && <div style={{ marginTop: 20, padding: 12, borderRadius: 6, background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', fontSize: 14 }}>{error.message}</div>}
    </div>
  )
}

