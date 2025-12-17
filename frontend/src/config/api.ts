const API_BASE = 'http://localhost:8000'

export const API_ENDPOINTS = {
  images: `${API_BASE}/images/`,
  login: `${API_BASE}/login`,
  register: `${API_BASE}/register`,
  quota: (user: string) => `${API_BASE}/quota/${encodeURIComponent(user)}`,
} as const

export default API_BASE
