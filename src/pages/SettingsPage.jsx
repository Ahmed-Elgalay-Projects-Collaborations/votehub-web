import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    company: ''
  })
  
  const [notifications, setNotifications] = useState({
    emailOnNewVote: true,
    emailOnPollClose: true,
    marketingEmails: false
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert("Profile updated successfully! (Mocked)")
    }, 800)
  }

  const handleSavePassword = (e) => {
    e.preventDefault()
    if (password.new !== password.confirm) {
      alert("New passwords do not match.")
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert("Password updated successfully! (Mocked)")
      setPassword({ current: '', new: '', confirm: '' })
    }, 800)
  }

  return (
    <div className="settings-page">
      <div className="settings-container animate-fade-in-up">
        
        <div className="settings-sidebar">
          <h2 className="settings-title">Account Settings</h2>
          <nav className="settings-nav">
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile Information
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Security
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Notifications
            </button>
          </nav>
        </div>

        <div className="settings-content">
          
          {activeTab === 'profile' && (
            <div className="settings-section animate-fade-in-up" key="profile">
              <h3>Profile Information</h3>
              <p className="settings-desc">Update your personal details and public profile.</p>
              
              <div className="settings-avatar-section">
                <div className="settings-avatar-large">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <button className="btn btn-secondary">Upload New Avatar</button>
                  <p className="settings-desc mt-1" style={{ fontSize: '0.8rem' }}>JPG or PNG, max 2MB.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company / Organization (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profile.company}
                    onChange={e => setProfile({...profile, company: e.target.value})}
                  />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section animate-fade-in-up" key="security">
              <h3>Security & Password</h3>
              <p className="settings-desc">Ensure your account is using a long, random password to stay secure.</p>
              
              <form onSubmit={handleSavePassword} className="settings-form mt-2">
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={password.current}
                    onChange={e => setPassword({...password, current: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={password.new}
                    onChange={e => setPassword({...password, new: e.target.value})}
                    required
                    minLength="8"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={password.confirm}
                    onChange={e => setPassword({...password, confirm: e.target.value})}
                    required
                    minLength="8"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section animate-fade-in-up" key="notifications">
              <h3>Email Notifications</h3>
              <p className="settings-desc">Choose what we email you about.</p>

              <div className="settings-form mt-2">
                <div className="setting-row">
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>New Votes</h4>
                    <p style={{ fontSize: '0.85rem' }}>Email me when someone votes on my poll.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.emailOnNewVote} 
                      onChange={e => setNotifications({...notifications, emailOnNewVote: e.target.checked})} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Poll Closed</h4>
                    <p style={{ fontSize: '0.85rem' }}>Email me a summary when a poll reaches its deadline.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.emailOnPollClose} 
                      onChange={e => setNotifications({...notifications, emailOnPollClose: e.target.checked})} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row" style={{ borderBottom: 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Marketing & Product Updates</h4>
                    <p style={{ fontSize: '0.85rem' }}>Receive news about new features and voting tips.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.marketingEmails} 
                      onChange={e => setNotifications({...notifications, marketingEmails: e.target.checked})} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
