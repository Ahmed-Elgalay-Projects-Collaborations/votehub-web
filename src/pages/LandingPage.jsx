import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [selectedOption, setSelectedOption] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)

  // Auto-vote simulation for the mockup demonstration
  useEffect(() => {
    const timer = setTimeout(() => setHasVoted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="landing-page">
      {/* Background Graphic Removed for Minimalist Grid Logo in CSS */}
      <div className="bg-decorations"></div>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title animate-fade-in-up delay-100">
            Make decisions <br />
            <span className="text-gradient">instantly and beautifully</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-200">
            Create completely customizable polls, engage your audience, and get real-time insights with the most elegant voting platform built for modern teams.
          </p>

          <div className="hero-buttons animate-fade-in-up delay-300">
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Create a Poll for Free
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              See how it works
            </a>
          </div>

          {/* Interactive Hero Mockup Container */}
          <div className="mockup-container animate-fade-in-up delay-400">

            {/* Floating popups giving depth */}
            <div className="floating-element float-1 animate-float">
              <div style={{ background: '#10b981', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-h)', margin: 0 }}>New Vote Cast</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text)', margin: 0 }}>Option: Absolutely</p>
              </div>
            </div>

            <div className="floating-element float-2 animate-float-delayed">
              <div style={{ background: '#6366f1', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-h)', margin: 0 }}>1,204 Total Votes</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text)', margin: 0 }}>Last hour: +42</p>
              </div>
            </div>

            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
                <div style={{ marginLeft: '1rem', background: 'var(--bg)', padding: '0.25rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  votehub.link/ship-it
                </div>
              </div>

              <div className="mockup-body">
                {/* Left Side: The Poll */}
                <div className="mockup-question">
                  <h3>Should we ship the new landing page?</h3>
                  <p>Product Team • Closes in 2 hours</p>

                  <div className="mockup-options">
                    <div className={`mockup-option ${selectedOption === 0 ? 'selected' : ''}`} onClick={() => setSelectedOption(0)}>
                      <div className="radio-circle"></div>
                      <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>Absolutely, it's ready!</span>
                    </div>
                    <div className={`mockup-option ${selectedOption === 1 ? 'selected' : ''}`} onClick={() => setSelectedOption(1)}>
                      <div className="radio-circle"></div>
                      <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>Needs more QA testing</span>
                    </div>
                    <div className={`mockup-option ${selectedOption === 2 ? 'selected' : ''}`} onClick={() => setSelectedOption(2)}>
                      <div className="radio-circle"></div>
                      <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>Scrap it</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Results */}
                <div className="mockup-results">
                  <h4>Live Results</h4>

                  <div className="result-item">
                    <div className="result-item-header">
                      <span>Absolutely, it's ready!</span>
                      <span>{hasVoted ? '68%' : '65%'}</span>
                    </div>
                    <div className="mockup-bar">
                      <div className="mockup-bar-fill" style={{ '--target-width': hasVoted ? '68%' : '65%' }}></div>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-item-header">
                      <span>Needs more QA testing</span>
                      <span style={{ color: 'var(--text)' }}>{hasVoted ? '28%' : '30%'}</span>
                    </div>
                    <div className="mockup-bar">
                      <div className="mockup-bar-fill" style={{ '--target-width': hasVoted ? '28%' : '30%', background: 'var(--border)' }}></div>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-item-header">
                      <span>Scrap it</span>
                      <span style={{ color: 'var(--text)' }}>{hasVoted ? '4%' : '5%'}</span>
                    </div>
                    <div className="mockup-bar">
                      <div className="mockup-bar-fill" style={{ '--target-width': hasVoted ? '4%' : '5%', background: 'var(--border)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-header">
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Powerful tools,<br />beautiful interface.</h2>
            <p style={{ fontSize: '1.25rem' }}>We stripped away the clutter and focused entirely on the experience. Both for you, and your voters.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10"></path>
                  <path d="M18 20V4"></path>
                  <path d="M6 20v-4"></path>
                </svg>
              </div>
              <h3 className="feature-title">Real-time Analytics</h3>
              <p>Watch the results roll in instantly. Our live charts update the moment a vote is cast, complete with smooth animations and detailed breakdown views without ever hitting refresh.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <h3 className="feature-title">Frictionless Sharing</h3>
              <p>Generate beautiful, branded short links. Your voters don't need to download an app or even create an account. They just click, vote, and see the results instantly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Enterprise Security</h3>
              <p>State-of-the-art protection against duplicate voting with IP logging, browser fingerprinting, and optional authentication requirements. Your data stays yours.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="section-header">
            <h2>How it works</h2>
            <p>Go from question to insights in less than 60 seconds.</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create your poll</h3>
              <p>Type your question, add options, and customize the look to match your brand.</p>
            </div>
            <div className="step-line"></div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Share the link</h3>
              <p>Send your unique, branded link to your audience via Slack, Email, or Social Media.</p>
            </div>
            <div className="step-line"></div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get live insights</h3>
              <p>Watch the votes roll in instantly with beautiful real-time analytics.</p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="use-cases-section">
          <div className="section-header">
            <h2>Built for modern teams</h2>
            <p>See how different organizations use VoteHub to make better decisions.</p>
          </div>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-badge">Product Managers</div>
              <h3>Feature Prioritization</h3>
              <p>Let your users or stakeholders vote on which features they want built next.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-badge">Event Organizers</div>
              <h3>Live Audience Q&A</h3>
              <p>Engage your audience during presentations with live polls and instant results.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-badge">Educators</div>
              <h3>Classroom Engagement</h3>
              <p>Test student knowledge and get immediate feedback on comprehension.</p>
            </div>
            <div className="use-case-card">
              <div className="use-case-badge">HR & People Ops</div>
              <h3>Team Sentiment</h3>
              <p>Gather anonymous feedback on team morale and company initiatives.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-box">
            <h2>Ready to decide?</h2>
            <p>Join thousands of professionals making better decisions every day.</p>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
              Start for free
            </Link>
          </div>
        </section>
      </main>


    </div>
  )
}
