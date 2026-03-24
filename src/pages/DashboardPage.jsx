import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPolls, deletePoll, changeElectionStatus, adminStepUp, ApiError } from '../services/api'
import PollCard from '../components/PollCard'
import SensitiveActionModal from '../components/security/SensitiveActionModal'
import AdminStepUpModal from '../components/security/AdminStepUpModal'

export default function DashboardPage() {
  const { user } = useAuth()
  const location = useLocation()

  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const [pageNotice, setPageNotice] = useState(location.state?.securityNotice || '')
  const [pageError, setPageError] = useState('')

  const [confirmAction, setConfirmAction] = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)

  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [stepUpSubmitting, setStepUpSubmitting] = useState(false)
  const [stepUpError, setStepUpError] = useState('')

  useEffect(() => {
    getPolls()
      .then(setPolls)
      .catch((err) => setPageError(err.message || 'Failed to load polls'))
      .finally(() => setLoading(false))
  }, [])

  const filteredPolls = polls.filter((poll) => {
    if (filter === 'all') return true
    if (filter === 'open') return poll.status === 'open' || poll.status === 'published'
    return poll.status === filter
  })

  const startAction = (action) => {
    setPageError('')
    setPageNotice('')
    setConfirmAction(action)
  }

  const buildActionSummary = (action) => {
    const base = [
      `Poll: ${action.poll.title}`,
      `Current status: ${action.poll.status}`,
    ]

    if (action.type === 'status') {
      base.push(`Target status: ${action.nextStatus}`)
    }

    if (action.type === 'delete') {
      base.push('This poll will be archived and hidden from default views.')
    }

    return base
  }

  const executeAction = async (action, adminStepUpToken = '') => {
    setActionSubmitting(true)

    try {
      if (action.type === 'delete') {
        await deletePoll(action.pollId, adminStepUpToken ? { adminStepUpToken } : {})
        setPolls((prev) => prev.filter((poll) => (poll._id || poll.id) !== action.pollId))
        setPageNotice('Poll archived successfully.')
      }

      if (action.type === 'status') {
        await changeElectionStatus(action.pollId, action.nextStatus, adminStepUpToken ? { adminStepUpToken } : {})
        setPolls((prev) => prev.map((poll) => ((poll._id || poll.id) === action.pollId ? { ...poll, status: action.nextStatus } : poll)))
        setPageNotice(`Poll status changed to ${action.nextStatus}.`)
      }

      setConfirmAction(null)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ADMIN_STEP_UP_REQUIRED') {
        setStepUpOpen(true)
        return
      }
      setPageError(err.message || 'Action failed')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    if (user?.role === 'admin') {
      setStepUpError('')
      setStepUpOpen(true)
      return
    }

    await executeAction(confirmAction)
  }

  const handleStepUpSubmit = async ({ currentPassword, otpCode, recoveryCode, votehubTrap }) => {
    if (!confirmAction) return

    setStepUpSubmitting(true)
    setStepUpError('')

    try {
      const { stepUpToken } = await adminStepUp(currentPassword, otpCode, recoveryCode, votehubTrap)
      setStepUpOpen(false)
      await executeAction(confirmAction, stepUpToken)
    } catch (err) {
      setStepUpError(err.message || 'Step-up verification failed')
    } finally {
      setStepUpSubmitting(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header animate-fade-in-up">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!</p>
            <div className="trust-indicators" style={{ marginTop: '0.75rem' }}>
              <span className={`trust-pill ${user?.emailVerified ? 'ok' : 'warn'}`}>
                {user?.emailVerified ? 'Email verified' : 'Email not verified'}
              </span>
              <span className={`trust-pill ${user?.otpEnabled ? 'ok' : 'warn'}`}>
                {user?.otpEnabled ? '2FA enabled' : '2FA disabled'}
              </span>
              {user?.role === 'admin' && <span className="trust-pill secure">Secure admin area</span>}
            </div>
          </div>

          {(user?.role === 'admin' || user?.canCreatePolls) && (
            <Link to="/polls/create" className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create New Poll
            </Link>
          )}
        </header>

        {pageNotice && <div className="security-notice">{pageNotice}</div>}
        {pageError && <div className="auth-error">{pageError}</div>}

        <div className="dashboard-filters animate-fade-in-up delay-100">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Polls</button>
          <button className={`filter-tab ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Active</button>
          <button className={`filter-tab ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>Closed</button>
          <button className={`filter-tab ${filter === 'draft' ? 'active' : ''}`} onClick={() => setFilter('draft')}>Drafts</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredPolls.length > 0 ? (
          <div className="poll-grid">
            {filteredPolls.map((poll, index) => {
              const pollId = poll._id || poll.id
              return (
                <div key={pollId} style={{ animationDelay: `${(index % 5) * 100}ms` }}>
                  <PollCard
                    poll={poll}
                    onDelete={() => startAction({ type: 'delete', pollId, poll })}
                    onChangeStatus={(id, nextStatus) => startAction({ type: 'status', pollId: id, poll, nextStatus })}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="dashboard-empty animate-fade-in-up delay-200">
            <div className="empty-icon">No Data</div>
            <h3>No polls found</h3>
            <p>You have not created any {filter !== 'all' ? filter : ''} polls yet.</p>
            {filter === 'all' && (user?.role === 'admin' || user?.canCreatePolls) && (
              <Link to="/polls/create" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Create your first poll
              </Link>
            )}
          </div>
        )}
      </div>

      <SensitiveActionModal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'delete' ? 'Confirm Poll Archive' : 'Confirm Poll Status Change'}
        summary={confirmAction ? buildActionSummary(confirmAction) : []}
        warning={
          confirmAction?.type === 'delete'
            ? 'Archived polls are hidden from normal views and require explicit restore workflows.'
            : 'Changing election status affects who can vote and when.'
        }
        confirmLabel={confirmAction?.type === 'delete' ? 'Archive Poll' : 'Apply Status'}
        danger={confirmAction?.type === 'delete'}
        submitting={actionSubmitting}
      />

      {stepUpOpen && (
        <AdminStepUpModal
          isOpen={stepUpOpen}
          onClose={() => setStepUpOpen(false)}
          onSubmit={handleStepUpSubmit}
          submitting={stepUpSubmitting}
          error={stepUpError}
          purpose="Admin-sensitive poll actions require password + OTP step-up verification."
        />
      )}
    </div>
  )
}
