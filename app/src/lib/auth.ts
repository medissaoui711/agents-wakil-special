/**
 * Authentication utilities for managing JWT tokens and user state
 */

const TOKEN_KEY = 'wakalat_token'
const USER_KEY = 'wakalat_user'

export interface User {
  id: number
  email: string
  is_active: boolean
  created_at: string
}

export const auth = {
  /**
   * Save token and user data to localStorage
   */
  login(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * Clear token and user data
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  /**
   * Get Authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken()
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  }
}
