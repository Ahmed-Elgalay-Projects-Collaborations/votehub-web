import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePoll } from '../hooks/usePoll'
import { vote } from '../services/api'

export default function PublicVotePage() {
  const { id } = useParams()
  const { poll, loading, error } = usePoll(id)
  
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)

  if (loading) return <div className="spinner" style={{marginTop: '20vh'}}></div>
  
  if (error || !poll) return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h2>Poll not found</h2>
      <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>This poll may have been deleted or never existed.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go Home</Link>
    </div>
  )

  const handleVote = async () => {
    if (selectedOption === null && poll.type !== 'open-text') return;

    setSubmitting(true)
    try {
      await vote(id, selectedOption)
      setVoted(true)
    } catch (err) {
      alert("Failed to submit vote. Try again.")
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
            
            {(poll.settings?.showResultsToVoters !== false) && (
               <Link to={`/polls/${id}/results`} className="btn btn-primary w-full" style={{ marginBottom: '1rem' }}>
                 View Live Results
               </Link>
            )}
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
        <span className="vote-badge">{poll.type.replace('-', ' ')}</span>
        <h1 className="vote-question">{poll.title}</h1>
        
        <div className="vote-options">
          {poll.type === 'multiple-choice' && poll.options.map((opt, i) => (
             <button 
               key={i} 
               className={`vote-option-btn ${selectedOption === i ? 'selected' : ''}`}
               onClick={() => setSelectedOption(i)}
             >
               <div className="radio-circle"></div>
               {opt}
             </button>
          ))}
          
          {poll.type === 'yes-no' && poll.options.map((opt, i) => (
             <button 
               key={i} 
               className={`vote-option-btn text-center ${selectedOption === i ? 'selected' : ''}`}
               onClick={() => setSelectedOption(i)}
             >
               {opt}
             </button>
          ))}

          {poll.type === 'rating' && (
             <div className="vote-rating-container">
               {poll.options.map((opt, i) => (
                 <button 
                   key={i} 
                   className={`vote-rating-circle ${selectedOption === i ? 'selected' : ''}`}
                   onClick={() => setSelectedOption(i)}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          )}

          {poll.type === 'open-text' && (
             <textarea 
                className="form-input" 
                rows="4" 
                placeholder="Type your answer here..."
                onChange={(e) => setSelectedOption(e.target.value)}
             ></textarea>
          )}
        </div>

        <button 
          className="btn btn-primary bg-gradient w-full" 
          style={{ marginTop: '2.5rem', padding: '1.25rem', fontSize: '1.1rem' }}
          onClick={handleVote}
          disabled={submitting || (selectedOption === null && poll.type !== 'open-text')}
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
