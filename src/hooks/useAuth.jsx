import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    api.getMe()
      .then((userData) => {
        setUser(userData)
        // Fetch CSRF token for authenticated session
        return api.getCsrfToken().catch(() => {})
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password)

    // If OTP is required, return the challenge for the UI to handle
    if (result.otpRequired) {
      return result
    }

    // Normal login success
    setUser(result.user)
    // Fetch CSRF token for the new session
    await api.getCsrfToken().catch(() => {})
    return result
  }, [])

  const verifyOtp = useCallback(async (challengeToken, otpCode, recoveryCode) => {
    const result = await api.verifyLoginOtp(challengeToken, otpCode, recoveryCode)
    setUser(result.user)
    await api.getCsrfToken().catch(() => {})
    return result
  }, [])

  const register = useCallback(async (fullName, email, password) => {
    const result = await api.register(fullName, email, password)
    // Registration does NOT log in — email verification is required
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Ignore errors during logout
    }
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe()
      setUser(userData)
      return userData
    } catch {
      setUser(null)
      return null
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    verifyOtp,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
