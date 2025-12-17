import { useState, useEffect } from 'react'
import { AuthToken } from '../types'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    if (savedToken && savedUsername) {
      setToken(savedToken)
      setCurrentUser(savedUsername)
      setIsAuthenticated(true)
    }
  }, [])

  const login = (authData: AuthToken) => {
    setToken(authData.access_token)
    setCurrentUser(authData.username)
    setIsAuthenticated(true)
    localStorage.setItem('token', authData.access_token)
    localStorage.setItem('username', authData.username)
  }

  const logout = () => {
    setToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  const getAuthHeaders = () => {
    if (!token) return {}
    return { 'Authorization': `Bearer ${token}` }
  }

  return {
    isAuthenticated,
    currentUser,
    token,
    login,
    logout,
    getAuthHeaders,
  }
}
