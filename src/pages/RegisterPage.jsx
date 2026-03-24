import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resendVerification } from '../services/api'

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}$/

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [votehubTrap, setVotehubTrap] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resending, setResending] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setError('Password must be 8+ chars with uppercase, lowercase, and a digit.')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password, votehubTrap)
      setRegistered(true)
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerification(email, votehubTrap)
    } catch {
      // Keep generic response behavior
    } finally {
      setResending(false)
    }
  }

  if (registered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 73px)', padding: '2rem' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '0.5rem', fontSize: '2rem' }}>Check your email</h2>
          <p style={{ color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            We sent a verification link to <strong style={{ color: 'var(--text-h)' }}>{email}</strong>.
          </p>
          <p style={{ color: 'var(--text)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Verify your email, then sign in to continue.
          </p>

          <button className="btn btn-secondary" onClick={handleResend} disabled={resending} style={{ marginBottom: '1rem' }}>
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" style={{ fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(2rem, 5vw, 6rem)',
          justifyContent: 'center',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text-h)', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Create an account
            </h1>
            <p style={{ color: 'var(--text)', margin: '0', fontSize: '1.05rem' }}>
              Secure registration with verified email and optional OTP setup.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" className="form-input" placeholder="Jane Doe" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" className="form-input" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Use uppercase, lowercase, and numbers"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Type password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div aria-hidden="true" className="honeypot-field">
              <label htmlFor="register-trap">Leave this field empty</label>
              <input
                id="register-trap"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={votehubTrap}
                onChange={(event) => setVotehubTrap(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div
        className="auth-right-panel"
        style={{
          flex: '1',
          background: 'radial-gradient(circle at center, #0f172a 0%, var(--surface-alt) 100%)',
          position: 'relative',
          padding: '4rem',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '2rem',
            padding: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            marginBottom: '3rem',
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          <img
            src="/auth-illustration.png"
            alt="VoteHub Premium UI"
            style={{ maxWidth: '100%', width: '420px', display: 'block', borderRadius: '1rem' }}
          />
        </div>

        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--text-h)', fontWeight: '700' }}>
          Start secure voting quickly
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text)', maxWidth: '420px', lineHeight: 1.6 }}>
          Create your account in under a minute with verified-email onboarding and stronger password validation.
        </p>
      </div>
    </div>
  )
}
