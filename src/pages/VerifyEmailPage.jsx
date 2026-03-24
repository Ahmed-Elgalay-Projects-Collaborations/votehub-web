import React from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyEmail } from '../services/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    verifyEmail(token)
      .then((data) => {
        setStatus('success')
        setMessage(data?.message || 'Email verified successfully!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Verification failed. The link may have expired.')
      })
  }, [token])

  const effectiveStatus = token ? status : 'error'
  const effectiveMessage = token ? message : 'No verification token provided.'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 73px)', padding: '2rem' }}>
      <div className="animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '480px' }}>
        {effectiveStatus === 'verifying' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 2rem' }}></div>
            <h2 style={{ color: 'var(--text-h)' }}>Verifying your email...</h2>
            <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>Please wait a moment.</p>
          </>
        )}

        {effectiveStatus === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>OK</div>
            <h2 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', lineHeight: 1.6 }}>{effectiveMessage}</p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
              Sign in to your account
            </Link>
          </>
        )}

        {effectiveStatus === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>X</div>
            <h2 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', lineHeight: 1.6 }}>{effectiveMessage}</p>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2rem' }}>
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
