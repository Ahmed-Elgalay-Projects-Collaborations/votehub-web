import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // OTP state
  const [otpStep, setOtpStep] = useState(false)
  const [otpSetupRequired, setOtpSetupRequired] = useState(false)
  const [challengeToken, setChallengeToken] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const { login, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)

      if (result.otpRequired) {
        setChallengeToken(result.otpChallengeToken)
        setOtpSetupRequired(result.otpSetupRequired || false)
        setOtpStep(true)
        setLoading(false)
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otpCode) {
      setError('Please enter the OTP code')
      return
    }

    setLoading(true)
    try {
      await verifyOtp(challengeToken, otpCode)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
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
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text-h)', fontWeight: '700', letterSpacing: '-0.02em' }}>
              {otpStep ? 'Two-Factor Auth' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--text)', margin: '0', fontSize: '1.05rem' }}>
              {otpStep 
                ? (otpSetupRequired ? 'Set up your authenticator app to continue.' : 'Enter the code from your authenticator app.')
                : 'Sign in to continue making decisions.'
              }
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {!otpStep ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="email" 
                    type="email" 
                    className="form-input" 
                    placeholder="name@company.com"
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
                    placeholder="••••••••"
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

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '0.875rem' }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label htmlFor="otpCode">Authentication Code</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="otpCode" 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{ paddingLeft: '2.5rem', fontSize: '1.25rem', letterSpacing: '0.3em', textAlign: 'center' }}
                    maxLength="6"
                    autoFocus
                    required
                  />
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '0.875rem' }}>
                {loading ? 'Verifying...' : 'Verify & Sign in'}
              </button>

              <button 
                type="button"
                className="btn btn-secondary btn-block" 
                onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}
                style={{ marginTop: '0.75rem' }}
              >
                Back to Login
              </button>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>Sign up for free</Link>
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
            alt="VoteHub Dashboard" 
            style={{ 
              maxWidth: '100%', 
              width: '420px',
              display: 'block',
              borderRadius: '1rem'
            }} 
          />
        </div>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--text-h)', fontWeight: '700' }}>
          Make better decisions, <span className="text-gradient">faster.</span>
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text)', maxWidth: '420px', lineHeight: 1.6 }}>
          Join thousands of modern teams executing brilliantly with beautifully designed, real-time polling.
        </p>
      </div>
    </div>
  )
}
