import { useState } from 'react'
import { LOGIN_URL } from '../config'

interface LoginProps {
  setToken: (token: string) => void
  switchToRegister: () => void
}

export default function Login({ setToken, switchToRegister }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        throw new Error('Login failed')
      }
      
      const data = await res.json()
      setToken(data.access_token)
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={{ maxWidth: '320px', margin: '0 auto', padding: '2rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Login</h2>
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
          Login
        </button>
      </form>
      {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Don't have an account? <button onClick={switchToRegister} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}>Register</button>
      </p>
    </div>
  )
}

