import { AuthFormData } from '../types'

interface AuthFormProps {
  authForm: AuthFormData
  setAuthForm: (form: AuthFormData) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>, isLogin: boolean) => void
  showLogin: boolean
  setShowLogin: (show: boolean) => void
}

export const AuthForm = ({ authForm, setAuthForm, onSubmit, showLogin, setShowLogin }: AuthFormProps) => {
  return (
    <div style={{ marginBottom: 40, padding: 32, background: '#f8f9fa', borderRadius: 12, border: '1px solid #e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button 
          onClick={() => setShowLogin(true)} 
          style={{ 
            padding: '10px 22px', 
            borderRadius: 6, 
            background: showLogin ? '#222' : '#ddd', 
            color: showLogin ? 'white' : '#555', 
            fontWeight: 600, 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Login
        </button>
        <button 
          onClick={() => setShowLogin(false)} 
          style={{ 
            padding: '10px 22px', 
            borderRadius: 6, 
            background: !showLogin ? '#222' : '#ddd', 
            color: !showLogin ? 'white' : '#555', 
            fontWeight: 600, 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Register
        </button>
      </div>
      <form onSubmit={(e) => onSubmit(e, showLogin)} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div>
          <label style={{ fontWeight: 500, color: '#333' }}>
            Username<br />
            <input 
              value={authForm.username} 
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} 
              required 
              style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 160 }} 
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#333' }}>
            Password<br />
            <input 
              type="password" 
              value={authForm.password} 
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} 
              required 
              style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 160 }} 
            />
          </label>
        </div>
        <button 
          type="submit" 
          style={{ 
            padding: '10px 22px', 
            borderRadius: 6, 
            background: '#222', 
            color: 'white', 
            fontWeight: 600, 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: 16 
          }}
        >
          {showLogin ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  )
}
