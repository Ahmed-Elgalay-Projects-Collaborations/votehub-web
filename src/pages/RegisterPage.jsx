import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resendVerification } from '../services/api'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resending, setResending] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
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
      await resendVerification(email)
    } catch {
      // Silent — API always returns success for security
    } finally {
      setResending(false)
    }
  }

  // Success state — show email verification message
  if (registered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 73px)', padding: '2rem' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📧</div>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '0.5rem', fontSize: '2rem' }}>Check your email</h2>
          <p style={{ color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            We've sent a verification link to <strong style={{ color: 'var(--text-h)' }}>{email}</strong>.
          </p>
          <p style={{ color: 'var(--text)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Click the link in the email to verify your account, then you can sign in.
          </p>

          <button 
            className="btn btn-secondary" 
            onClick={handleResend} 
            disabled={resending}
            style={{ marginBottom: '1rem' }}
          >
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
      {/* Left Form Side */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: 'clamp(2rem, 5vw, 6rem)',
        justifyContent: 'center',
        backgroundColor: 'var(--surface)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text-h)', fontWeight: '700', letterSpacing: '-0.02em' }}>Create an account</h1>
            <p style={{ color: 'var(--text)', margin: '0', fontSize: '1.05rem' }}>Start making beautiful polls in seconds.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="name" 
                  type="text" 
                  className="form-input" 
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="email">Email address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="email" 
                  type="email" 
                  className="form-input" 
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem', padding: '0.875rem' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>

      {/* Right Content / Illustration Side */}
      <div style={{ 
        flex: '1', 
        display: 'none', 
        background: 'radial-gradient(circle at center, #0f172a 0%, var(--surface-alt) 100%)',
        position: 'relative',
        padding: '4rem',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderLeft: '1px solid var(--border)'
      }} className="auth-right-panel">
        <style>{`
          @media (min-width: 900px) {
            .auth-right-panel { display: flex !important; }
          }
        `}</style>
        
        <div style={{ 
          background: '#ffffff',
          borderRadius: '2rem',
          padding: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          marginBottom: '3rem',
          animation: 'float 6s ease-in-out infinite'
        }}>
          <img 
            src="/auth-illustration.png" 
            alt="VoteHub Premium UI" 
            style={{ 
              maxWidth: '100%', 
              width: '420px',
              display: 'block',
              borderRadius: '1rem'
            }} 
          />
        </div>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--text-h)', fontWeight: '700' }}>
          Engage your audience <span className="text-gradient">instantly.</span>
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text)', maxWidth: '420px', lineHeight: 1.6 }}>
          Set up an account in under 60 seconds and start creating beautiful, high-converting polls today.
        </p>
      </div>
    </div>
  )
}
