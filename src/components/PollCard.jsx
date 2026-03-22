import { Link } from 'react-router-dom'

export default function PollCard({ poll, onDelete }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'var(--primary)';
      case 'closed': return '#ef4444';
      case 'draft': return 'var(--text)';
      default: return 'var(--text)';
    }
  }

  return (
    <div className="poll-card animate-fade-in-up">
      <div className="poll-card-header">
        <span className="poll-status" style={{ color: getStatusColor(poll.status), borderColor: getStatusColor(poll.status), backgroundColor: `${getStatusColor(poll.status)}15` }}>
          {poll.status.toUpperCase()}
        </span>
        <span className="poll-type">{poll.type.replace('-', ' ')}</span>
      </div>
      <h3 className="poll-card-title">{poll.title}</h3>
      <div className="poll-card-footer">
        <div className="poll-stats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{poll.voteCount} votes</span>
        </div>
        <div className="poll-actions">
          <Link to={`/polls/${poll.id}/edit`} className="btn-icon" title="Edit Poll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </Link>
          <Link to={`/polls/${poll.id}/results`} className="btn-icon" title="View Results">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </Link>
          <button onClick={() => onDelete(poll.id)} className="btn-icon delete-btn" title="Delete Poll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
