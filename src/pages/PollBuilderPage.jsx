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
  const [pollType, setPollType] = useState('poll')
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState([{ label: '' }, { label: '' }])
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState('draft')
  const [maxSelections, setMaxSelections] = useState(1)
  const [settings, setSettings] = useState({
    resultsVisibility: 'after_close', // always, after_close
  })

  useEffect(() => {
    if (isEditing) {
      getPoll(id).then(election => {
        if (election) {
          setPollType(election.type || 'poll')
          setQuestion(election.title)
          setDescription(election.description || '')
          setOptions(election.options?.map(o => typeof o === 'string' ? { label: o } : o) || [{ label: '' }, { label: '' }])
          setStartsAt(election.startsAt ? new Date(election.startsAt).toISOString().slice(0, 16) : '')
          setEndsAt(election.endsAt ? new Date(election.endsAt).toISOString().slice(0, 16) : '')
          setStatus(election.status || 'draft')
          setMaxSelections(election.maxSelections || 1)
          setSettings({
            resultsVisibility: election.resultsVisibility || 'after_close',
          })
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleAddOption = () => {
    setOptions([...options, { label: '' }])
  }

  const handleUpdateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], label: value }
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
    const validOptions = options.filter(o => o.label.trim() !== '')
    if (validOptions.length < 2) {
      alert("Please provide at least two valid options.")
      return
    }
    if (!startsAt || !endsAt) {
      alert("Please set start and end dates.")
      return
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      alert("End date must be after start date.")
      return
    }

    setSubmitting(true)
    const pollData = {
      title: question,
      description,
      type: pollType,
      options: validOptions.map(o => ({ label: o.label.trim(), description: o.description || '' })),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      maxSelections,
      resultsVisibility: settings.resultsVisibility,
      status,
    }

    try {
      if (isEditing) {
        await updatePoll(id, pollData)
      } else {
        await createPoll(pollData)
      }
      navigate('/dashboard')
    } catch (err) {
      alert(err.message || "Error saving poll")
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
                  { id: 'poll', icon: 'M12 4v16m8-8H4', title: 'Poll', desc: 'Standard poll — single or multiple choice' },
                  { id: 'election', icon: 'M5 13l4 4L19 7', title: 'Election', desc: 'Formal election with candidates' },
                  { id: 'campaign', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', title: 'Campaign', desc: 'Run a campaign with multiple rounds' },
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
                  <label>Poll Title</label>
                  <input 
                    type="text" 
                    className="form-input text-xl font-bold" 
                    placeholder="e.g., Best JS Framework 2025?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Provide additional context for voters..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="options-list mt-2">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Options</label>
                  {options.map((opt, i) => (
                    <div key={i} className="option-row">
                      <div className="option-drag-handle">⋮⋮</div>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={`Option ${i + 1}`}
                        value={opt.label}
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
              </div>
            )}

            {step === 3 && (
              <div className="settings-setup">
                <div className="form-group">
                  <label>Poll Status</label>
                  <select 
                    className="form-input" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Draft (Save for later)</option>
                    <option value="published">Published (Visible, but not started)</option>
                    <option value="open">Open (Active and ready for votes)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Max Selections per Voter</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <h4>Show Results Immediately</h4>
                    <p>Voters see the results while voting is still open.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.resultsVisibility === 'always'} 
                      onChange={e => setSettings({...settings, resultsVisibility: e.target.checked ? 'always' : 'after_close'})} 
                    />
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
              
              <div className="preview-options">
                {options.filter(o => o.label.trim()).length > 0 ? 
                  options.filter(o => o.label.trim()).map((o, i) => (
                    <div key={i} className="preview-option-btn">{o.label}</div>
                  )) : 
                  <div className="preview-option-btn opacity-50">Option 1</div>
                }
              </div>
              
              <button className="btn btn-primary w-full mt-2" disabled style={{ opacity: 0.5 }}>Submit Vote</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
