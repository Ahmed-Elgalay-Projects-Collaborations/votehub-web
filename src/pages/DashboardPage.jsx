import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPolls, deletePoll, changeElectionStatus } from '../services/api'
import PollCard from '../components/PollCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, open, closed, draft

  useEffect(() => {
    getPolls()
      .then(setPolls)
      .finally(() => setLoading(false))
  }, [])

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      await deletePoll(pollId)
      setPolls(polls.filter(p => !((p._id || p.id) === pollId)))
    }
  }

  const handleChangeStatus = async (pollId, status) => {
    try {
      await changeElectionStatus(pollId, status)
      setPolls(polls.map(p => (p._id || p.id) === pollId ? { ...p, status } : p))
    } catch (err) {
      alert(err.message || 'Failed to change poll status')
    }
  }

  const filteredPolls = polls.filter(poll => {
    if (filter === 'all') return true
    if (filter === 'open') return poll.status === 'open' || poll.status === 'published'
    return poll.status === filter
  })

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        <header className="dashboard-header animate-fade-in-up">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!</p>
          </div>
          <Link to="/polls/create" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Poll
          </Link>
        </header>

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
            {filteredPolls.map((poll, i) => (
              <div key={poll._id} style={{ animationDelay: `${(i % 5) * 100}ms` }}>
                <PollCard poll={poll} onDelete={handleDeletePoll} onChangeStatus={handleChangeStatus} />
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty animate-fade-in-up delay-200">
            <div className="empty-icon">📊</div>
            <h3>No polls found</h3>
            <p>You haven't created any {filter !== 'all' ? filter : ''} polls yet.</p>
            {filter === 'all' && (
              <Link to="/polls/create" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Create your first poll
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
