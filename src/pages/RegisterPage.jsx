import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  
  const navigate = useNavigate()

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
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create account. Please try again.')
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
                  type="password" 
                  className="form-input" 
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  className="form-input" 
                  placeholder="Type password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
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
