import { useState, useEffect } from 'react'
import { getMe } from '../services/api'

// Simple global state for the mockup to track if user is artificially logged in during this session
let IS_LOGGED_IN_MOCK = false
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = () => {
    setLoading(true)
    if (IS_LOGGED_IN_MOCK) {
      getMe()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    } else {
      setUser(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
    listeners.add(checkSession)
    return () => listeners.delete(checkSession)
  }, [])

  // Override login/register mocks to set our temporary global state
  const loginMock = async () => { IS_LOGGED_IN_MOCK = true; notifyListeners(); }
  const logoutMock = async () => { IS_LOGGED_IN_MOCK = false; notifyListeners(); window.location.href = '/'; }
  const registerMock = async () => { IS_LOGGED_IN_MOCK = true; notifyListeners(); }

  return { 
    user, 
    loading, 
    login: loginMock, 
    logout: logoutMock, 
    register: registerMock 
  }
}
