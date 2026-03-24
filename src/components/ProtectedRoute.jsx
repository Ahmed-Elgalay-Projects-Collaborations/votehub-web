import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePollCreator = false,
  requireOtpEnabled = false,
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingBottom: '20vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (requirePollCreator && !(user.role === 'admin' || user.canCreatePolls)) {
    return <Navigate to="/dashboard" replace state={{ securityNotice: 'Poll creation permission is required.' }} />
  }

  if (requireOtpEnabled && !user.otpEnabled) {
    return <Navigate to="/settings" replace state={{ securityNotice: 'Two-factor authentication is required for this page.' }} />
  }

  return children
}
