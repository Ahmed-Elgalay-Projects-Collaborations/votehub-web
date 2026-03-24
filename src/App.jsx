import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import DashboardPage from './pages/DashboardPage'
import PollBuilderPage from './pages/PollBuilderPage'
import ResultsPage from './pages/ResultsPage'
import PublicVotePage from './pages/PublicVotePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import FrameGuard from './components/FrameGuard'

export default function App() {
  return (
    <BrowserRouter>
      <FrameGuard>
        <Navbar />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/vote/:id" element={<PublicVotePage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route
            path="/polls/create"
            element={<ProtectedRoute requirePollCreator><PollBuilderPage /></ProtectedRoute>}
          />
          <Route
            path="/polls/:id/edit"
            element={<ProtectedRoute requirePollCreator><PollBuilderPage /></ProtectedRoute>}
          />
          <Route path="/polls/:id/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer />
      </FrameGuard>
    </BrowserRouter>
  )
}
