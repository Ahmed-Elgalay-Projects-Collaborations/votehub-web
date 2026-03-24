import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProtectedRoute from '../ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderProtectedRoute(element) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/login" element={<div>Login Screen</div>} />
        <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
        <Route path="/settings" element={<div>Settings Screen</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute (functional)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    })
  })

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute(
      <ProtectedRoute>
        <div>Secure Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Login Screen')).toBeInTheDocument()
  })

  it('blocks users without poll-creator permission when route requires it', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        role: 'voter',
        canCreatePolls: false,
        otpEnabled: false,
      },
      loading: false,
    })

    renderProtectedRoute(
      <ProtectedRoute requirePollCreator>
        <div>Poll Builder</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument()
  })

  it('allows poll creator users when route requires poll-creator permission', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        role: 'voter',
        canCreatePolls: true,
        otpEnabled: false,
      },
      loading: false,
    })

    renderProtectedRoute(
      <ProtectedRoute requirePollCreator>
        <div>Poll Builder</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Poll Builder')).toBeInTheDocument()
  })

  it('redirects to settings when OTP is required but disabled', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        role: 'voter',
        canCreatePolls: true,
        otpEnabled: false,
      },
      loading: false,
    })

    renderProtectedRoute(
      <ProtectedRoute requireOtpEnabled>
        <div>Secure Action</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Settings Screen')).toBeInTheDocument()
  })
})
