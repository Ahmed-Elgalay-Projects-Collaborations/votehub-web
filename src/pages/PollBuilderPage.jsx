import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createPoll, updatePoll, getPoll, adminStepUp } from '../services/api'
import AdminStepUpModal from '../components/security/AdminStepUpModal'
import SensitiveActionModal from '../components/security/SensitiveActionModal'

export default function PollBuilderPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [votehubTrap, setVotehubTrap] = useState('')

  const [pageError, setPageError] = useState('')
  const [pageNotice, setPageNotice] = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [stepUpSubmitting, setStepUpSubmitting] = useState(false)
  const [stepUpError, setStepUpError] = useState('')

  const [pollType, setPollType] = useState('poll')
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState([{ label: '' }, { label: '' }])
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState('draft')
  const [maxSelections, setMaxSelections] = useState(1)
  const [settings, setSettings] = useState({
    resultsVisibility: 'after_close',
  })

  useEffect(() => {
    if (!isEditing) return

    getPoll(id)
      .then((election) => {
        if (!election) return

        setPollType(election.type || 'poll')
        setQuestion(election.title)
        setDescription(election.description || '')
        setOptions(election.options?.map((option) => (typeof option === 'string' ? { label: option } : option)) || [{ label: '' }, { label: '' }])
        setStartsAt(election.startsAt ? new Date(election.startsAt).toISOString().slice(0, 16) : '')
        setEndsAt(election.endsAt ? new Date(election.endsAt).toISOString().slice(0, 16) : '')
        setStatus(election.status || 'draft')
        setMaxSelections(election.maxSelections || 1)
        setSettings({
          resultsVisibility: election.resultsVisibility || 'after_close',
        })
      })
      .catch((err) => setPageError(err.message || 'Failed to load poll'))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { label: '' }])
  }

  const handleUpdateOption = (index, value) => {
    setOptions((prev) => prev.map((option, idx) => (idx === index ? { ...option, label: value } : option)))
  }

  const handleRemoveOption = (index) => {
    setOptions((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== index) : prev))
  }

  const buildPollData = () => {
    const validOptions = options.filter((option) => option.label.trim() !== '')
    return {
      title: question,
      description,
      type: pollType,
      options: validOptions.map((option) => ({ label: option.label.trim(), description: option.description || '' })),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      maxSelections,
      resultsVisibility: settings.resultsVisibility,
      status,
      votehubTrap,
    }
  }

  const validatePoll = () => {
    if (!question.trim()) return 'Please enter a poll title.'

    const validOptions = options.filter((option) => option.label.trim() !== '')
    if (validOptions.length < 2) return 'Please provide at least two valid options.'

    if (!startsAt || !endsAt) return 'Please set start and end dates.'

    if (new Date(endsAt) <= new Date(startsAt)) return 'End date must be after start date.'

    if (maxSelections > validOptions.length) return 'Max selections cannot be greater than number of options.'

    return null
  }

  const submitPoll = async (adminStepUpToken = '') => {
    const payload = buildPollData()
    setSubmitting(true)
    setPageError('')

    try {
      if (isEditing) {
        await updatePoll(id, payload, adminStepUpToken ? { adminStepUpToken } : {})
      } else {
        await createPoll(payload, adminStepUpToken ? { adminStepUpToken } : {})
      }

      navigate('/dashboard')
    } catch (err) {
      setPageError(err.message || 'Error saving poll')
    } finally {
      setSubmitting(false)
    }
  }

  const requestFinalConfirmation = () => {
    const validationError = validatePoll()
    if (validationError) {
      setPageError(validationError)
      return
    }

    setPageError('')
    setPageNotice('Review details before final submission.')
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false)

    if (user?.role === 'admin') {
      setStepUpOpen(true)
      return
    }

    await submitPoll()
  }

  const handleStepUpSubmit = async ({ currentPassword, otpCode, recoveryCode, votehubTrap: trap }) => {
    setStepUpSubmitting(true)
    setStepUpError('')

    try {
      const { stepUpToken } = await adminStepUp(currentPassword, otpCode, recoveryCode, trap)
      setStepUpOpen(false)
      await submitPoll(stepUpToken)
    } catch (err) {
      setStepUpError(err.message || 'Step-up verification failed')
    } finally {
      setStepUpSubmitting(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }}></div>

  const validOptions = options.filter((option) => option.label.trim() !== '')

  return (
    <div className="poll-builder-page">
      <div className="builder-container">
        <div className="builder-editor">
          <div className="builder-header">
            <button className="btn-icon" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h2>{isEditing ? 'Edit Poll' : 'Create New Poll'}</h2>
          </div>

          <div className="trust-indicators" style={{ marginBottom: '1rem' }}>
            <span className={`trust-pill ${user?.emailVerified ? 'ok' : 'warn'}`}>
              {user?.emailVerified ? 'Email verified' : 'Email not verified'}
            </span>
            <span className={`trust-pill ${user?.otpEnabled ? 'ok' : 'warn'}`}>
              {user?.otpEnabled ? '2FA enabled' : '2FA disabled'}
            </span>
            {user?.role === 'admin' && <span className="trust-pill secure">Admin step-up required on save</span>}
          </div>

          {pageNotice && <div className="security-notice">{pageNotice}</div>}
          {pageError && <div className="auth-error">{pageError}</div>}

          <div className="builder-steps">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Type</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Content</div>
            <div className="step-line"></div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3. Settings</div>
          </div>

          <div className="step-content animate-fade-in-up" key={step}>
            {step === 1 && (
              <div className="type-selection grid-2">
                {[
                  { id: 'poll', icon: 'M12 4v16m8-8H4', title: 'Poll', desc: 'Standard poll - single or multiple choice' },
                  { id: 'election', icon: 'M5 13l4 4L19 7', title: 'Election', desc: 'Formal election with candidates' },
                  { id: 'campaign', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', title: 'Campaign', desc: 'Run a campaign with multiple rounds' },
                ].map((type) => (
                  <div key={type.id} className={`type-card ${pollType === type.id ? 'selected' : ''}`} onClick={() => setPollType(type.id)}>
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={type.icon} />
                    </svg>
                    <h4>{type.title}</h4>
                    <p>{type.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="content-setup">
                <div className="form-group">
                  <label>Poll Title</label>
                  <input
                    type="text"
                    className="form-input text-xl font-bold"
                    placeholder="e.g., Best JS Framework 2026?"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Provide additional context for voters..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="options-list mt-2">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Options</label>
                  {options.map((option, index) => (
                    <div key={index} className="option-row">
                      <div className="option-drag-handle">::</div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Option ${index + 1}`}
                        value={option.label}
                        onChange={(event) => handleUpdateOption(index, event.target.value)}
                      />
                      <button className="btn-icon text-danger" onClick={() => handleRemoveOption(index)} disabled={options.length <= 2}>
                        x
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary mt-1" onClick={handleAddOption} style={{ width: '100%' }}>
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="settings-setup">
                <div className="form-group">
                  <label>Poll Status</label>
                  <select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="draft">Draft (Save for later)</option>
                    <option value="published">Published (Visible, not started)</option>
                    <option value="open">Open (Active voting)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input type="datetime-local" className="form-input" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input type="datetime-local" className="form-input" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
                </div>

                <div className="form-group">
                  <label>Max Selections per Voter</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxSelections}
                    onChange={(event) => setMaxSelections(Math.max(1, parseInt(event.target.value, 10) || 1))}
                    min="1"
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Show Results Immediately</h4>
                    <p>Voters can see results while voting is still open.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.resultsVisibility === 'always'}
                      onChange={(event) => setSettings({ ...settings, resultsVisibility: event.target.checked ? 'always' : 'after_close' })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div aria-hidden="true" className="honeypot-field" style={{ marginTop: '1rem' }}>
                  <label htmlFor="poll-builder-trap">Leave this field empty</label>
                  <input
                    id="poll-builder-trap"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={votehubTrap}
                    onChange={(event) => setVotehubTrap(event.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="builder-footer">
            {step > 1 ? (
              <button className="btn btn-secondary" onClick={() => setStep((current) => current - 1)}>Back</button>
            ) : <div></div>}

            {step < 3 ? (
              <button className="btn btn-primary" onClick={() => setStep((current) => current + 1)} disabled={step === 2 && !question.trim()}>
                Continue
              </button>
            ) : (
              <button className="btn btn-primary bg-gradient" onClick={requestFinalConfirmation} disabled={submitting}>
                {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Poll')}
              </button>
            )}
          </div>
        </div>

        <div className="builder-preview">
          <div className="preview-label">Live Preview</div>
          <div className="mockup-wrap">
            <div className="vote-card-preview">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {question || 'Your question will appear here...'}
              </h3>

              <div className="preview-options">
                {validOptions.length > 0
                  ? validOptions.map((option, index) => (
                    <div key={`${option.label}-${index}`} className="preview-option-btn">{option.label}</div>
                  ))
                  : <div className="preview-option-btn opacity-50">Option 1</div>}
              </div>

              <button className="btn btn-primary w-full mt-2" disabled style={{ opacity: 0.5 }}>Submit Vote</button>
            </div>
          </div>
        </div>
      </div>

      <SensitiveActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title={isEditing ? 'Confirm Poll Update' : 'Confirm Poll Creation'}
        summary={[
          `Title: ${question}`,
          `Status: ${status}`,
          `Options: ${validOptions.length}`,
          `Window: ${startsAt || 'N/A'} to ${endsAt || 'N/A'}`,
        ]}
        warning="Verify details carefully before submitting. Election state and schedule impact voter access."
        confirmLabel={isEditing ? 'Save Changes' : 'Create Poll'}
        submitting={submitting}
      />

      <AdminStepUpModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        onSubmit={handleStepUpSubmit}
        submitting={stepUpSubmitting}
        error={stepUpError}
        purpose="Admin poll mutations require a one-time step-up token (password + OTP/recovery code)."
      />
    </div>
  )
}
