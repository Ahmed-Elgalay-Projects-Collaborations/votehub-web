import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer animate-fade-in-up">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo">
              <img src="/votehub-logo.png" alt="VoteHub Logo" className="logo-icon" />
              VoteHub
            </Link>
            <p className="footer-desc">
              The modern platform for creating engaging polls, getting instant feedback, and making better decisions together.
            </p>
            <div className="footer-socials footer-socials-clean">
              <a href="#" className="social-icon social-icon-clean" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
              </a>
              <a href="#" className="social-icon social-icon-clean" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="#" className="social-icon social-icon-clean" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>Product</h4>
            <Link to="/#features">Features</Link>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/">Templates</Link>
            <Link to="/">Integrations</Link>
          </div>

          <div className="footer-links-group">
            <h4>Resources</h4>
            <Link to="/">Help Center</Link>
            <Link to="/">Blog</Link>
            <Link to="/">API Documentation</Link>
            <Link to="/">Community</Link>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VoteHub Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
