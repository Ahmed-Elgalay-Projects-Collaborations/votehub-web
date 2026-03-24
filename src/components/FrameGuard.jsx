import { useState } from 'react'

export default function FrameGuard({ children }) {
  const [isFramed] = useState(() => {
    try {
      return window.self !== window.top
    } catch {
      return true
    }
  })

  if (!isFramed) {
    return children
  }

  return (
    <div className="frame-guard">
      <div className="frame-guard-card">
        <h2>Blocked Embedded View</h2>
        <p>
          VoteHub blocks embedded usage for account and voting safety. Open this page directly in a browser tab.
        </p>
      </div>
    </div>
  )
}
