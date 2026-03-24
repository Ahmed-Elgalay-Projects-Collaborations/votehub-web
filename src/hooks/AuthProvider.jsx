import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import { AuthContext } from './authContext'

const SESSION_RESET_CODES = new Set(['TOKEN_INVALID', 'INVALID_TOKEN_CONTEXT', 'AUTH_REQUIRED'])

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe()
      .then((userData) => {
        setUser(userData)
        return api.getCsrfToken().catch(() => {})
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleSessionAnomaly(event) {
      const detail = event?.detail || {}
      if (!SESSION_RESET_CODES.has(detail.code)) {
        return
      }

      setUser(null)
      if (typeof window !== 'undefined' && detail.message) {
        window.sessionStorage.setItem('votehub-session-alert', detail.message)
      }
    }

    window.addEventListener(api.SESSION_ANOMALY_EVENT, handleSessionAnomaly)
    return () => window.removeEventListener(api.SESSION_ANOMALY_EVENT, handleSessionAnomaly)
  }, [])

  const login = useCallback(async (email, password, votehubTrap = '') => {
    const result = await api.login(email, password, votehubTrap)

    if (result.otpRequired) {
      return result
    }

    setUser(result.user)
    await api.getCsrfToken().catch(() => {})
    return result
  }, [])

  const verifyOtp = useCallback(async (challengeToken, otpCode, recoveryCode, votehubTrap = '') => {
    const result = await api.verifyLoginOtp(challengeToken, otpCode, recoveryCode, votehubTrap)
    setUser(result.user)
    await api.getCsrfToken().catch(() => {})
    return result
  }, [])

  const startOtpSetup = useCallback(async (challengeToken, votehubTrap = '') => {
    return await api.startOtpSetup(challengeToken, votehubTrap)
  }, [])

  const completeOtpSetup = useCallback(async (otpCode, challengeToken, votehubTrap = '') => {
    const result = await api.verifyOtpSetup(otpCode, challengeToken, votehubTrap)

    if (result.user) {
      setUser(result.user)
      await api.getCsrfToken().catch(() => {})
    } else {
      await api.getMe().then(setUser).catch(() => setUser(null))
    }

    return result
  }, [])

  const disableOtp = useCallback(async (currentPassword, otpCode, recoveryCode, votehubTrap = '') => {
    const result = await api.disableOtp(currentPassword, otpCode, recoveryCode, votehubTrap)
    const userData = await api.getMe()
    setUser(userData)
    return result
  }, [])

  const register = useCallback(async (fullName, email, password, votehubTrap = '') => {
    return await api.register(fullName, email, password, votehubTrap)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Ignore logout errors and still clear local auth state
    }

    api.clearApiSessionState()
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
    startOtpSetup,
    completeOtpSetup,
    disableOtp,
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
