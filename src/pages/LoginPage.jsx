import React from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sessionNotice, setSessionNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [votehubTrap, setVotehubTrap] = useState('')

  const [otpStep, setOtpStep] = useState(false)
  const [otpSetupRequired, setOtpSetupRequired] = useState(false)
  const [challengeToken, setChallengeToken] = useState('')
  const [riskLevel, setRiskLevel] = useState('low')

  const [otpCode, setOtpCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  const [setupLoading, setSetupLoading] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState([])

  const { login, verifyOtp, startOtpSetup, completeOtpSetup } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const message = window.sessionStorage.getItem('votehub-session-alert')
    if (message) {
      setSessionNotice(message)
      window.sessionStorage.removeItem('votehub-session-alert')
    }
  }, [])

  const startOtpEnrollmentFlow = async (token) => {
    setSetupLoading(true)
    try {
      const enrollment = await startOtpSetup(token, votehubTrap)
      setSetupData(enrollment)
    } catch (err) {
      setError(err.message || 'Failed to start OTP setup')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSessionNotice('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password, votehubTrap)

      if (result.otpRequired) {
        setChallengeToken(result.otpChallengeToken)
        setOtpSetupRequired(result.otpSetupRequired || false)
        setRiskLevel(result.riskLevel || 'low')
        setOtpStep(true)

        if (result.otpSetupRequired) {
          await startOtpEnrollmentFlow(result.otpChallengeToken)
        }
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setError('')

    setLoading(true)
    try {
      if (otpSetupRequired) {
        const result = await completeOtpSetup(otpCode, challengeToken, votehubTrap)
        const recoveryCodes = result?.recoveryCodes || []

        if (recoveryCodes.length > 0) {
          setGeneratedRecoveryCodes(recoveryCodes)
          return
        }

        navigate('/dashboard')
        return
      }

      await verifyOtp(
        challengeToken,
        useRecoveryCode ? '' : otpCode,
        useRecoveryCode ? recoveryCode : '',
        votehubTrap
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP challenge response')
    } finally {
      setLoading(false)
    }
  }

  const resetOtpFlow = () => {
    setOtpStep(false)
    setOtpSetupRequired(false)
    setChallengeToken('')
    setOtpCode('')
    setRecoveryCode('')
    setUseRecoveryCode(false)
    setSetupData(null)
    setGeneratedRecoveryCodes([])
    setError('')
  }

  const copySensitive = async (value, label) => {
    const shouldCopy = window.confirm(`${label} is sensitive. Copy to clipboard anyway?`)
    if (!shouldCopy) return

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      setError(`Failed to copy ${label.toLowerCase()}.`) 
    }
  }

  const canSubmitOtp = otpSetupRequired
    ? otpCode.length === 6
    : (useRecoveryCode ? recoveryCode.trim().length > 0 : otpCode.length === 6)

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
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text-h)', fontWeight: '700', letterSpacing: '-0.02em' }}>
              {otpStep ? 'Two-Factor Verification' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--text)', margin: '0', fontSize: '1.05rem' }}>
              {otpStep
                ? (otpSetupRequired
                  ? 'Set up your authenticator app and verify one code to continue.'
                  : 'Enter your authenticator code or recovery code.')
                : 'Sign in to continue securely.'}
            </p>
          </div>

          {sessionNotice && <div className="security-notice">{sessionNotice}</div>}
          {error && <div className="auth-error">{error}</div>}

          {!otpStep ? (
            <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="username"
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="current-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
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
                      padding: '0.25rem',
                      color: 'var(--text)',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div aria-hidden="true" className="honeypot-field">
                <label htmlFor="login-trap">Leave this field empty</label>
                <input
                  id="login-trap"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={votehubTrap}
                  onChange={(event) => setVotehubTrap(event.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : generatedRecoveryCodes.length > 0 ? (
            <div className="recovery-codes-panel">
              <h3>Save Your Recovery Codes</h3>
              <p>
                These codes are shown once. Store them offline in a password manager or secure vault.
              </p>
              <div className="recovery-codes-grid">
                {generatedRecoveryCodes.map((code) => (
                  <code key={code}>{code}</code>
                ))}
              </div>
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => copySensitive(generatedRecoveryCodes.join('\n'), 'Recovery codes')}
                >
                  Copy codes
                </button>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleOtpSubmit} autoComplete="on">
              <div className="security-notice" style={{ marginBottom: '1rem' }}>
                Risk level: <strong>{riskLevel}</strong>
              </div>

              {otpSetupRequired && setupLoading && <p style={{ color: 'var(--text)' }}>Preparing OTP enrollment...</p>}

              {otpSetupRequired && setupData && (
                <div className="otp-setup-card">
                  <h3>Authenticator Setup</h3>
                  <p>Scan the QR code in your authenticator app, then enter the generated 6-digit code.</p>
                  <img src={setupData.qrCodeDataUrl} alt="OTP QR Code" className="otp-qr" />
                  <p style={{ marginBottom: '0.5rem' }}>Manual key:</p>
                  <code className="otp-manual-key">{setupData.manualEntryKey}</code>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => copySensitive(setupData.manualEntryKey, 'OTP setup key')}
                    >
                      Copy setup key
                    </button>
                  </div>
                </div>
              )}

              {!otpSetupRequired && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useRecoveryCode}
                      onChange={(event) => setUseRecoveryCode(event.target.checked)}
                    />
                    <span>Use recovery code instead of OTP</span>
                  </label>
                </div>
              )}

              {!useRecoveryCode ? (
                <div className="form-group">
                  <label htmlFor="otpCode">Authenticator code</label>
                  <input
                    id="otpCode"
                    name="one-time-code"
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="recoveryCode">Recovery code</label>
                  <input
                    id="recoveryCode"
                    name="recovery-code"
                    type="text"
                    className="form-input"
                    placeholder="Enter recovery code"
                    value={recoveryCode}
                    onChange={(event) => setRecoveryCode(event.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || !canSubmitOtp}>
                {loading ? 'Verifying...' : (otpSetupRequired ? 'Verify and enable OTP' : 'Verify and sign in')}
              </button>

              <button type="button" className="btn btn-secondary btn-block" onClick={resetOtpFlow}>
                Back to login
              </button>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
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
            alt="VoteHub Dashboard"
            style={{
              maxWidth: '100%',
              width: '420px',
              display: 'block',
              borderRadius: '1rem',
            }}
          />
        </div>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--text-h)', fontWeight: '700' }}>
          Security-first voting UX
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text)', maxWidth: '420px', lineHeight: 1.6 }}>
          OTP challenge, receipt verification, and trusted session handling are built into every secure workflow.
        </p>
      </div>
    </div>
  )
}
