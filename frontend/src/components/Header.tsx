interface HeaderProps {
  isAuthenticated: boolean
  currentUser: string | null
  onLogout: () => void
}

export const Header = ({ isAuthenticated, currentUser, onLogout }: HeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-2px', color: '#222', margin: 0 }}>
        Image Gallery
      </h1>
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600, color: '#555' }}>Welcome, {currentUser}!</span>
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              background: '#e74c3c', 
              color: 'white', 
              fontWeight: 600, 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
