import { useState } from 'react'
import Modal from '../ui/Modal'

const INITIAL_STATE = {
  currentPassword: '',
  otpCode: '',
  recoveryCode: '',
  votehubTrap: '',
  useRecoveryCode: false,
}

export default function AdminStepUpModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  error = '',
  purpose = 'Confirm admin action',
}) {
  const [form, setForm] = useState(INITIAL_STATE)

  const handleClose = () => {
    setForm(INITIAL_STATE)
    onClose?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit({
      currentPassword: form.currentPassword,
      otpCode: form.useRecoveryCode ? '' : form.otpCode,
      recoveryCode: form.useRecoveryCode ? form.recoveryCode : '',
      votehubTrap: form.votehubTrap,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Admin Step-Up Verification">
      <p className="modal-description">{purpose}</p>
      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="step-up-password">Current Password</label>
          <input
            id="step-up-password"
            type="password"
            className="form-input"
            value={form.currentPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.useRecoveryCode}
              onChange={(event) => setForm((prev) => ({ ...prev, useRecoveryCode: event.target.checked }))}
            />
            <span>Use recovery code instead of OTP</span>
          </label>
        </div>

        {!form.useRecoveryCode ? (
          <div className="form-group">
            <label htmlFor="step-up-otp">Authenticator OTP</label>
            <input
              id="step-up-otp"
              type="text"
              className="form-input"
              value={form.otpCode}
              onChange={(event) => setForm((prev) => ({ ...prev, otpCode: event.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))}
              inputMode="numeric"
              maxLength={6}
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="step-up-recovery">Recovery Code</label>
            <input
              id="step-up-recovery"
              type="text"
              className="form-input"
              value={form.recoveryCode}
              onChange={(event) => setForm((prev) => ({ ...prev, recoveryCode: event.target.value.trim() }))}
              required
            />
          </div>
        )}

        <div aria-hidden="true" className="honeypot-field">
          <label htmlFor="step-up-trap">Leave this field empty</label>
          <input
            id="step-up-trap"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.votehubTrap}
            onChange={(event) => setForm((prev) => ({ ...prev, votehubTrap: event.target.value }))}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify and Continue'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
