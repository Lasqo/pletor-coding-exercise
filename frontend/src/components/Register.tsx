import { useState } from 'react'
import { REGISTER_URL } from '../config'

interface RegisterProps {
  setToken: (token: string) => void
  switchToLogin: () => void
}

export default function Register({ setToken, switchToLogin }: RegisterProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Registration failed')
      }

      const data = await res.json()
      setToken(data.access_token)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '320px', margin: '0 auto', padding: '2rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
        />
        <button type="submit" style={{ padding: '10px', background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Already have an account? <button onClick={switchToLogin} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}>Login</button>
      </p>
    </div>
  )
}

