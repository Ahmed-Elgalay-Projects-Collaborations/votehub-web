import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPage() {
  const { user, startOtpSetup, completeOtpSetup, disableOtp, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [notifications, setNotifications] = useState({
    emailOnNewVote: true,
    emailOnPollClose: true,
    marketingEmails: false,
  })

  const [setupLoading, setSetupLoading] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [setupOtpCode, setSetupOtpCode] = useState('')
  const [setupRecoveryCodes, setSetupRecoveryCodes] = useState([])

  const [disableSubmitting, setDisableSubmitting] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableOtpCode, setDisableOtpCode] = useState('')
  const [disableRecoveryCode, setDisableRecoveryCode] = useState('')
  const [disableUseRecovery, setDisableUseRecovery] = useState(false)

  const [votehubTrap, setVotehubTrap] = useState('')

  const canDisableOtp = user?.otpEnabled && user?.role !== 'admin'
  const securityStatus = useMemo(() => {
    if (!user) return []

    return [
      { label: user.emailVerified ? 'Email verified' : 'Email not verified', ok: user.emailVerified },
      { label: user.otpEnabled ? '2FA enabled' : '2FA disabled', ok: user.otpEnabled },
      { label: user.role === 'admin' ? 'Secure admin area' : 'Standard account', ok: user.role === 'admin' },
    ]
  }, [user])

  const clearMessages = () => {
    setNotice('')
    setError('')
  }

  const resetSensitiveSetupState = () => {
    setSetupData(null)
    setSetupOtpCode('')
    setSetupRecoveryCodes([])
  }

  const copySensitive = async (value, label) => {
    const shouldCopy = window.confirm(`${label} is sensitive. Copy to clipboard anyway?`)
    if (!shouldCopy) return

    try {
      await navigator.clipboard.writeText(value)
      setNotice(`${label} copied to clipboard.`)
    } catch {
      setError(`Failed to copy ${label.toLowerCase()}.`)
    }
  }

  const beginOtpSetup = async () => {
    clearMessages()
    setSetupLoading(true)

    try {
      const data = await startOtpSetup(undefined, votehubTrap)
      setSetupData(data)
      setNotice('Scan the QR code and enter one OTP to activate 2FA.')
    } catch (err) {
      setError(err.message || 'Failed to start OTP setup')
    } finally {
      setSetupLoading(false)
    }
  }

  const verifyOtpEnrollment = async (event) => {
    event.preventDefault()
    clearMessages()
    setSetupLoading(true)

    try {
      const result = await completeOtpSetup(setupOtpCode, undefined, votehubTrap)
      setSetupRecoveryCodes(result?.recoveryCodes || [])
      await refreshUser()
      setNotice('2FA enabled successfully. Save your recovery codes now.')
      setSetupOtpCode('')
    } catch (err) {
      setError(err.message || 'Failed to verify OTP setup')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleDisableOtp = async (event) => {
    event.preventDefault()
    clearMessages()
    setDisableSubmitting(true)

    try {
      await disableOtp(
        disablePassword,
        disableUseRecovery ? '' : disableOtpCode,
        disableUseRecovery ? disableRecoveryCode : '',
        votehubTrap
      )

      await refreshUser()
      setDisablePassword('')
      setDisableOtpCode('')
      setDisableRecoveryCode('')
      setDisableUseRecovery(false)
      resetSensitiveSetupState()
      setNotice('2FA disabled successfully.')
    } catch (err) {
      setError(err.message || 'Failed to disable OTP')
    } finally {
      setDisableSubmitting(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container animate-fade-in-up">
        <div className="settings-sidebar">
          <h2 className="settings-title">Account Security</h2>
          <nav className="settings-nav">
            <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              Profile
            </button>
            <button className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              Security
            </button>
            <button className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              Notifications
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {notice && <div className="security-notice">{notice}</div>}
          {error && <div className="auth-error">{error}</div>}

          {activeTab === 'profile' && (
            <div className="settings-section animate-fade-in-up" key="profile">
              <h3>Profile</h3>
              <p className="settings-desc">
                Profile edits are backend-dependent and currently read-only in this client.
              </p>

              <div className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-input" value={user?.fullName || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" className="form-input" value={user?.role || 'voter'} disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section animate-fade-in-up" key="security">
              <h3>Security Controls</h3>
              <p className="settings-desc">
                Manage two-factor authentication and account trust state.
              </p>

              <div className="trust-indicators" style={{ marginBottom: '1.5rem' }}>
                {securityStatus.map((item) => (
                  <span key={item.label} className={`trust-pill ${item.ok ? 'ok' : 'warn'}`}>
                    {item.label}
                  </span>
                ))}
              </div>

              {!user?.otpEnabled && (
                <div className="otp-setup-card">
                  <h4>Enable OTP</h4>
                  <p>Add authenticator-based OTP to harden account access.</p>

                  {!setupData ? (
                    <button type="button" className="btn btn-primary" onClick={beginOtpSetup} disabled={setupLoading}>
                      {setupLoading ? 'Preparing...' : 'Start OTP Setup'}
                    </button>
                  ) : (
                    <>
                      <img src={setupData.qrCodeDataUrl} alt="OTP QR Code" className="otp-qr" />
                      <p style={{ marginTop: '0.5rem' }}>Manual setup key:</p>
                      <code className="otp-manual-key">{setupData.manualEntryKey}</code>

                      <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: '0.75rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => copySensitive(setupData.manualEntryKey, 'OTP setup key')}
                        >
                          Copy setup key
                        </button>
                      </div>

                      {setupRecoveryCodes.length === 0 ? (
                        <form onSubmit={verifyOtpEnrollment} className="auth-form" style={{ marginTop: '1rem' }}>
                          <div className="form-group">
                            <label htmlFor="setup-otp-code">Authenticator OTP</label>
                            <input
                              id="setup-otp-code"
                              type="text"
                              className="form-input"
                              value={setupOtpCode}
                              onChange={(event) => setSetupOtpCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                              inputMode="numeric"
                              maxLength={6}
                              required
                            />
                          </div>
                          <button type="submit" className="btn btn-primary" disabled={setupLoading || setupOtpCode.length !== 6}>
                            {setupLoading ? 'Verifying...' : 'Enable OTP'}
                          </button>
                        </form>
                      ) : (
                        <div className="recovery-codes-panel" style={{ marginTop: '1rem' }}>
                          <h4>Recovery Codes</h4>
                          <p>These are shown once. Save them securely before leaving this page.</p>
                          <div className="recovery-codes-grid">
                            {setupRecoveryCodes.map((code) => (
                              <code key={code}>{code}</code>
                            ))}
                          </div>
                          <div className="modal-actions" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => copySensitive(setupRecoveryCodes.join('\n'), 'Recovery codes')}
                            >
                              Copy recovery codes
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => {
                                resetSensitiveSetupState()
                                setNotice('OTP setup complete. Recovery codes hidden again.')
                              }}
                            >
                              I saved them
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {user?.otpEnabled && user?.role === 'admin' && (
                <div className="security-notice">
                  Admin accounts must keep OTP enabled. Disable action is blocked by backend policy.
                </div>
              )}

              {canDisableOtp && (
                <div className="otp-setup-card" style={{ marginTop: '1.5rem' }}>
                  <h4>Disable OTP</h4>
                  <p>Requires your current password and OTP or recovery code.</p>

                  <form onSubmit={handleDisableOtp} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="disable-password">Current Password</label>
                      <input
                        id="disable-password"
                        type="password"
                        className="form-input"
                        value={disablePassword}
                        onChange={(event) => setDisablePassword(event.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={disableUseRecovery}
                          onChange={(event) => setDisableUseRecovery(event.target.checked)}
                        />
                        <span>Use recovery code</span>
                      </label>
                    </div>

                    {!disableUseRecovery ? (
                      <div className="form-group">
                        <label htmlFor="disable-otp">OTP Code</label>
                        <input
                          id="disable-otp"
                          type="text"
                          className="form-input"
                          value={disableOtpCode}
                          onChange={(event) => setDisableOtpCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          inputMode="numeric"
                          maxLength={6}
                          required
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label htmlFor="disable-recovery">Recovery Code</label>
                        <input
                          id="disable-recovery"
                          type="text"
                          className="form-input"
                          value={disableRecoveryCode}
                          onChange={(event) => setDisableRecoveryCode(event.target.value)}
                          required
                        />
                      </div>
                    )}

                    <button type="submit" className="btn btn-danger" disabled={disableSubmitting}>
                      {disableSubmitting ? 'Disabling...' : 'Disable OTP'}
                    </button>
                  </form>
                </div>
              )}

              <div aria-hidden="true" className="honeypot-field" style={{ marginTop: '1rem' }}>
                <label htmlFor="settings-trap">Leave this field empty</label>
                <input
                  id="settings-trap"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={votehubTrap}
                  onChange={(event) => setVotehubTrap(event.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section animate-fade-in-up" key="notifications">
              <h3>Email Notifications</h3>
              <p className="settings-desc">Notification preferences are currently client-side only until backend support is added.</p>

              <div className="settings-form mt-2">
                <div className="setting-row">
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>New Votes</h4>
                    <p style={{ fontSize: '0.85rem' }}>Email me when someone votes on my poll.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.emailOnNewVote}
                      onChange={(event) => setNotifications({ ...notifications, emailOnNewVote: event.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Poll Closed</h4>
                    <p style={{ fontSize: '0.85rem' }}>Email me a summary when a poll reaches its deadline.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.emailOnPollClose}
                      onChange={(event) => setNotifications({ ...notifications, emailOnPollClose: event.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row" style={{ borderBottom: 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Marketing Updates</h4>
                    <p style={{ fontSize: '0.85rem' }}>Receive product news and voting tips.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={(event) => setNotifications({ ...notifications, marketingEmails: event.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
