import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPoll, updatePoll, getPoll } from '../services/api'

export default function PollBuilderPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)

  // Poll Data State
  const [pollType, setPollType] = useState('multiple-choice')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [settings, setSettings] = useState({
    visibility: 'public', // public, unlisted
    requireLoginToVote: false,
    allowMultipleVotes: false,
    showResultsToVoters: true,
  })

  useEffect(() => {
    if (isEditing) {
      getPoll(id).then(poll => {
        if (poll) {
          setPollType(poll.type)
          setQuestion(poll.title)
          setOptions(poll.options)
          // setSettings(poll.settings) if they existed
        }
        setLoading(false)
      })
    }
  }, [id, isEditing])

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleUpdateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!question.trim()) {
      alert("Please enter a question.")
      return
    }
    const validOptions = options.filter(o => o.trim() !== '')
    if (pollType === 'multiple-choice' && validOptions.length < 2) {
      alert("Please provide at least two valid options.")
      return
    }

    setSubmitting(true)
    const pollData = {
      title: question,
      type: pollType,
      options: pollType === 'multiple-choice' ? validOptions : (pollType === 'yes-no' ? ['Yes', 'No'] : ['1','2','3','4','5']),
      settings,
      status: 'active'
    }

    try {
      if (isEditing) {
        await updatePoll(id, pollData)
      } else {
        await createPoll(pollData)
      }
      navigate('/dashboard')
    } catch (err) {
      alert("Error saving poll")
      setSubmitting(false)
    }
  }

  if (loading) return <div className="spinner" style={{marginTop: '4rem'}}></div>

  return (
    <div className="poll-builder-page">
      <div className="builder-container">
        
        {/* Left Col: Editor */}
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
                  { id: 'multiple-choice', icon: 'M12 4v16m8-8H4', title: 'Multiple Choice', desc: 'Let voters pick from options' },
                  { id: 'yes-no', icon: 'M5 13l4 4L19 7', title: 'Yes / No', desc: 'Simple binary decision' },
                  { id: 'rating', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', title: 'Rating 1-5', desc: 'Get a score out of 5' },
                  { id: 'open-text', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', title: 'Open Text', desc: 'Free-form text answers' }
                ].map(t => (
                  <div 
                    key={t.id} 
                    className={`type-card ${pollType === t.id ? 'selected' : ''}`}
                    onClick={() => setPollType(t.id)}
                  >
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={t.icon}/>
                    </svg>
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="content-setup">
                <div className="form-group">
                  <label>Poll Question</label>
                  <input 
                    type="text" 
                    className="form-input text-xl font-bold" 
                    placeholder="e.g., What should we order for lunch?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    autoFocus
                  />
                </div>

                {pollType === 'multiple-choice' && (
                  <div className="options-list mt-2">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Options</label>
                    {options.map((opt, i) => (
                      <div key={i} className="option-row">
                        <div className="option-drag-handle">⋮⋮</div>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(i, e.target.value)}
                        />
                        <button 
                          className="btn-icon text-danger" 
                          onClick={() => handleRemoveOption(i)}
                          disabled={options.length <= 2}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-secondary mt-1" onClick={handleAddOption} style={{ width: '100%' }}>
                      + Add Option
                    </button>
                  </div>
                )}
                
                {pollType === 'yes-no' && (
                  <div className="options-preview-static">
                    <div className="option-static">Yes</div>
                    <div className="option-static">No</div>
                  </div>
                )}
                
                {pollType === 'rating' && (
                  <div className="options-preview-static flex-row">
                    {[1,2,3,4,5].map(n => <div key={n} className="option-static-circle">{n}</div>)}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="settings-setup">
                <div className="setting-row">
                  <div>
                    <h4>Require Login to Vote</h4>
                    <p>Voters must have an account to participate.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.requireLoginToVote} onChange={e => setSettings({...settings, requireLoginToVote: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Allow Multiple Votes</h4>
                    <p>Users can vote more than once.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.allowMultipleVotes} onChange={e => setSettings({...settings, allowMultipleVotes: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Show Results Immediately</h4>
                    <p>Voters see the results directly after voting.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.showResultsToVoters} onChange={e => setSettings({...settings, showResultsToVoters: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="builder-footer">
            {step > 1 ? (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === 2 && !question.trim()}>Continue</button>
            ) : (
              <button className="btn btn-primary bg-gradient" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Poll')}
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Live Preview */}
        <div className="builder-preview">
          <div className="preview-label">Live Preview</div>
          <div className="mockup-wrap">
            <div className="vote-card-preview">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {question || 'Your question will appear here...'}
              </h3>
              
              {pollType === 'multiple-choice' && (
                <div className="preview-options">
                  {options.filter(o => o.trim()).length > 0 ? 
                    options.filter(o => o.trim()).map((o, i) => (
                      <div key={i} className="preview-option-btn">{o}</div>
                    )) : 
                    <div className="preview-option-btn opacity-50">Option 1</div>
                  }
                </div>
              )}

              {pollType === 'yes-no' && (
                <div className="preview-options flex-row">
                  <div className="preview-option-btn text-center">Yes</div>
                  <div className="preview-option-btn text-center">No</div>
                </div>
              )}

              {pollType === 'rating' && (
                <div className="preview-options flex-row gap-sm justify-center">
                  {[1,2,3,4,5].map(n => <div key={n} className="preview-rating-btn">{n}</div>)}
                </div>
              )}
              
              <button className="btn btn-primary w-full mt-2" disabled style={{ opacity: 0.5 }}>Submit Vote</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
