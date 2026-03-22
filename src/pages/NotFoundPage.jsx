import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 73px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'var(--bg)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1100px',
        gap: '4rem',
        flexWrap: 'wrap'
      }}>
        {/* Left Side: Text */}
        <div style={{ flex: '1', minWidth: '300px', animation: 'slideInRight 0.6s ease-out' }}>
          <h1 style={{ 
            fontFamily: 'monospace',
            fontSize: 'clamp(3rem, 5vw, 5rem)', 
            margin: '0', 
            color: 'var(--text-h)', 
            lineHeight: 1,
            letterSpacing: '0.1em'
          }}>
            404<span style={{color: 'var(--text)'}}>-error</span>
          </h1>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
            marginTop: '1.5rem', 
            color: 'var(--text-h)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            PAGE NOT FOUND
          </h2>
          <p style={{ color: 'var(--text)', margin: '1rem 0 3rem', fontSize: '1.125rem', opacity: 0.9 }}>
            Your search has ventured beyond the known universe.
          </p>
          <Link to="/" className="btn btn-primary" style={{ 
            padding: '0.875rem 2.5rem',
            borderRadius: '999px',
            fontSize: '1rem',
            letterSpacing: '0.05em'
          }}>
            Back To Home
          </Link>
        </div>

        {/* Right Side: Illustration */}
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Glowing Aura Effect */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, var(--gradient-1) 0%, var(--primary) 40%, transparent 70%)',
            filter: 'blur(90px)',
            opacity: 0.25,
            zIndex: 0,
            animation: 'pulseGlow 6s infinite alternate'
          }}></div>
          
          <img 
            src="/404-illustration.png" 
            alt="Lost Illustration" 
            className="illustration-blend"
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              display: 'block',
              position: 'relative',
              zIndex: 1,
              animation: 'float 8s ease-in-out infinite'
            }} 
          />
        </div>
      </div>
    </div>
  )
}
