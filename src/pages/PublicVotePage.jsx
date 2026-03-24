import React from 'react'
import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePoll } from '../hooks/usePoll'
import { useAuth } from '../hooks/useAuth'
import { vote, verifyVoteReceipt } from '../services/api'
import SensitiveActionModal from '../components/security/SensitiveActionModal'

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `vote-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function PublicVotePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { poll, loading, error } = usePoll(id)

  const [selectedOptions, setSelectedOptions] = useState([])
  const [voteState, setVoteState] = useState('idle')
  const [voteReceipt, setVoteReceipt] = useState(null)
  const [receiptVerification, setReceiptVerification] = useState(null)
  const [votehubTrap, setVotehubTrap] = useState('')

  const [pageError, setPageError] = useState('')
  const [pageNotice, setPageNotice] = useState('')

  const maxSelections = poll?.maxSelections || 1

  const selectedOptionLabels = useMemo(() => {
    const idSet = new Set(selectedOptions)
    return (poll?.options || [])
      .filter((option) => idSet.has(option._id || option.id))
      .map((option) => option.label)
  }, [poll?.options, selectedOptions])

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }}></div>

  if (error || !poll) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2>Poll not found</h2>
        <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>This poll may have been deleted or never existed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go Home</Link>
      </div>
    )
  }

  const toggleOption = (optionId) => {
    if (voteState === 'submitting') return

    if (maxSelections === 1) {
      setSelectedOptions([optionId])
      return
    }

    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((idValue) => idValue !== optionId)
      }
      if (prev.length >= maxSelections) return prev
      return [...prev, optionId]
    })
  }

  const submitVote = async () => {
    if (!user) {
      setPageError('You must sign in to cast a vote.')
      return
    }

    if (selectedOptions.length === 0 || voteState === 'submitting') {
      return
    }

    setVoteState('submitting')
    setPageError('')

    try {
      const idempotencyKey = createIdempotencyKey()
      const result = await vote(id, selectedOptions, { idempotencyKey }, votehubTrap)
      setVoteReceipt(result.receipt)
      setVoteState('submitted')
      setPageNotice('Vote submitted and receipt generated.')
    } catch (err) {
      if (err.code === 'DUPLICATE_VOTE') {
        setPageError('A vote is already recorded for this election and account.')
      } else {
        setPageError(err.message || 'Failed to submit vote. Try again.')
      }
      setVoteState('idle')
    }
  }

  const handleVerifyReceipt = async () => {
    if (!voteReceipt) return

    try {
      const verification = await verifyVoteReceipt(voteReceipt)
      setReceiptVerification(verification)
      setPageNotice(verification.valid ? 'Receipt signature validated successfully.' : 'Receipt validation failed.')
    } catch (err) {
      setPageError(err.message || 'Failed to verify receipt')
    }
  }

  if (voteState === 'submitted') {
    return (
      <div className="vote-page">
        <div className="vote-container animate-fade-in-up">
          <div className="vote-success">
            <div className="success-icon">OK</div>
            <h2>Vote Recorded</h2>
            <p style={{ color: 'var(--text)', margin: '1rem 0 2rem' }}>
              Your vote is stored and linked to a signed receipt for integrity checks.
            </p>

            {pageNotice && <div className="security-notice" style={{ marginBottom: '1rem' }}>{pageNotice}</div>}
            {pageError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{pageError}</div>}

            {voteReceipt && (
              <div className="receipt-card">
                <h3>Signed Receipt</h3>
                <p><strong>Vote ID:</strong> {voteReceipt.payload?.voteId}</p>
                <p><strong>Recorded At:</strong> {voteReceipt.payload?.recordedAt}</p>
                <p><strong>Integrity Hash:</strong> <code>{voteReceipt.payload?.integrityHash}</code></p>
                <button type="button" className="btn btn-secondary" onClick={handleVerifyReceipt}>
                  Verify receipt signature
                </button>

                {receiptVerification && (
                  <div className={`trust-pill ${receiptVerification.valid ? 'ok' : 'warn'}`} style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                    {receiptVerification.valid ? 'Receipt verified' : 'Receipt invalid'}
                  </div>
                )}
              </div>
            )}

            <Link to={`/polls/${id}/results`} className="btn btn-primary w-full" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              View Live Results
            </Link>
            <Link to="/dashboard" className="btn btn-secondary w-full">Back to Dashboard</Link>

            <div className="vote-footer-branding">
              Powered by <Link to="/">VoteHub</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vote-page">
      <div className="vote-container animate-fade-in-up">
        <span className="vote-badge">{poll.type}</span>
        <h1 className="vote-question">{poll.title}</h1>

        {poll.description && (
          <p style={{ color: 'var(--text)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{poll.description}</p>
        )}

        <div className="trust-indicators" style={{ marginBottom: '1rem' }}>
          <span className={`trust-pill ${user ? 'ok' : 'warn'}`}>
            {user ? 'Authenticated voting session' : 'Sign-in required to vote'}
          </span>
          {user && <span className={`trust-pill ${user.otpEnabled ? 'ok' : 'warn'}`}>{user.otpEnabled ? '2FA enabled' : '2FA optional'}</span>}
        </div>

        {pageNotice && <div className="security-notice">{pageNotice}</div>}
        {pageError && <div className="auth-error">{pageError}</div>}

        {!user && (
          <div className="security-notice" style={{ marginBottom: '1rem' }}>
            Please <Link to="/login">sign in</Link> to cast your vote and receive a signed receipt.
          </div>
        )}

        {maxSelections > 1 && (
          <p style={{ color: 'var(--text)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Select up to {maxSelections} options
          </p>
        )}

        <div className="vote-options">
          {poll.options && poll.options.map((option) => {
            const optionId = option._id || option.id
            const isSelected = selectedOptions.includes(optionId)

            return (
              <button
                key={optionId}
                className={`vote-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleOption(optionId)}
              >
                <div className="radio-circle"></div>
                {option.label}
                {option.description && (
                  <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>{option.description}</span>
                )}
              </button>
            )
          })}
        </div>

        <div aria-hidden="true" className="honeypot-field" style={{ marginTop: '1rem' }}>
          <label htmlFor="vote-trap">Leave this field empty</label>
          <input
            id="vote-trap"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={votehubTrap}
            onChange={(event) => setVotehubTrap(event.target.value)}
          />
        </div>

        <button
          className="btn btn-primary bg-gradient w-full"
          style={{ marginTop: '2.5rem', padding: '1.25rem', fontSize: '1.1rem' }}
          onClick={() => setVoteState('confirm')}
          disabled={!user || voteState === 'submitting' || selectedOptions.length === 0}
        >
          {voteState === 'submitting' ? 'Submitting...' : 'Review and Submit Vote'}
        </button>

        <div className="vote-footer-branding">
          Powered by <Link to="/">VoteHub</Link>
        </div>
      </div>

      <SensitiveActionModal
        isOpen={voteState === 'confirm'}
        onClose={() => setVoteState('idle')}
        onConfirm={submitVote}
        title="Confirm Vote Submission"
        summary={[
          `Poll: ${poll.title}`,
          `Selections: ${selectedOptionLabels.join(', ') || 'None'}`,
          'A duplicate vote from this account will be rejected.',
        ]}
        warning="Once submitted, your vote cannot be changed from this screen."
        confirmLabel="Submit Vote"
        submitting={voteState === 'submitting'}
      />
    </div>
  )
}
