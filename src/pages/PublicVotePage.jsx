import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePoll } from '../hooks/usePoll'
import { vote } from '../services/api'

export default function PublicVotePage() {
  const { id } = useParams()
  const { poll, loading, error } = usePoll(id)
  
  const [selectedOptions, setSelectedOptions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [voteReceipt, setVoteReceipt] = useState(null)

  if (loading) return <div className="spinner" style={{marginTop: '20vh'}}></div>
  
  if (error || !poll) return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h2>Poll not found</h2>
      <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>This poll may have been deleted or never existed.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go Home</Link>
    </div>
  )

  const maxSelections = poll.maxSelections || 1

  const toggleOption = (optionId) => {
    if (maxSelections === 1) {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId)
        }
        if (prev.length >= maxSelections) return prev
        return [...prev, optionId]
      })
    }
  }

  const handleVote = async () => {
    if (selectedOptions.length === 0) return

    setSubmitting(true)
    try {
      const result = await vote(id, selectedOptions)
      setVoteReceipt(result.receipt)
      setVoted(true)
    } catch (err) {
      alert(err.message || "Failed to submit vote. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (voted) {
    return (
      <div className="vote-page">
        <div className="vote-container animate-fade-in-up">
          <div className="vote-success">
            <div className="success-icon">✓</div>
            <h2>Vote Recorded!</h2>
            <p style={{ color: 'var(--text)', margin: '1rem 0 2rem' }}>Thank you for participating.</p>
            
            <Link to={`/polls/${id}/results`} className="btn btn-primary w-full" style={{ marginBottom: '1rem' }}>
              View Live Results
            </Link>
            <Link to="/register" className="btn btn-secondary w-full">Create your own poll</Link>
            
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
        {maxSelections > 1 && (
          <p style={{ color: 'var(--text)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Select up to {maxSelections} options
          </p>
        )}
        
        <div className="vote-options">
          {poll.options && poll.options.map((opt) => {
            const optionId = opt._id || opt.id
            const isSelected = selectedOptions.includes(optionId)
            return (
              <button 
                key={optionId} 
                className={`vote-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleOption(optionId)}
              >
                <div className="radio-circle"></div>
                {opt.label}
                {opt.description && (
                  <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>{opt.description}</span>
                )}
              </button>
            )
          })}
        </div>

        <button 
          className="btn btn-primary bg-gradient w-full" 
          style={{ marginTop: '2.5rem', padding: '1.25rem', fontSize: '1.1rem' }}
          onClick={handleVote}
          disabled={submitting || selectedOptions.length === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Vote'}
        </button>

        <div className="vote-footer-branding">
          Powered by <Link to="/">VoteHub</Link>
        </div>
      </div>
    </div>
  )
}
