import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults } from '../services/api'

export default function ResultsPage() {
  const { id } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResults(id)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="spinner" style={{marginTop: '20vh'}}></div>
  
  if (!results) return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h2>Results not found</h2>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Dashboard</Link>
    </div>
  )

  // Find max votes to calculate percentage bar widths
  const maxVotes = Math.max(...results.options.map(o => o.votes), 1) // prevent div by 0

  return (
    <div className="results-page">
      <div className="results-container animate-fade-in-up">
        
        <header className="results-header">
          <div>
            <span className="results-badge">Live Results</span>
            <h1 className="results-title">{results.title}</h1>
            <p className="results-total">{results.totalVotes} total votes</p>
          </div>
          <div className="results-actions">
            <button className="btn btn-secondary btn-icon-text" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/vote/${id}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Copy Link
            </button>
          </div>
        </header>

        <div className="results-chart">
          {results.options.map((opt, i) => {
            const percentage = (opt.votes / maxVotes) * 100;
            const absolutePercentage = results.totalVotes > 0 
              ? Math.round((opt.votes / results.totalVotes) * 100) 
              : 0;
            
            return (
              <div key={i} className="chart-row">
                <div className="chart-label-container">
                  <span className="chart-label">{opt.label}</span>
                  <span className="chart-votes">{opt.votes} ({absolutePercentage}%)</span>
                </div>
                <div className="chart-bar-bg">
                  <div 
                    className="chart-bar-fill animate-fill-bar" 
                    style={{ 
                      '--target-width': `${percentage}%`,
                      animationDelay: `${i * 100}ms`
                    }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
