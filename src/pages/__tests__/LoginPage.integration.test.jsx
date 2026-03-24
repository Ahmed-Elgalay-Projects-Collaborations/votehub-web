import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import LoginPage from '../LoginPage'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage OTP onboarding (integration)', () => {
  it('runs OTP-setup-required challenge and displays recovery codes', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue({
      otpRequired: true,
      otpSetupRequired: true,
      otpChallengeToken: 'challenge-123',
      riskLevel: 'high',
    })
    const startOtpSetup = vi.fn().mockResolvedValue({
      qrCodeDataUrl: 'data:image/png;base64,test',
      manualEntryKey: 'MANUAL-KEY-123',
    })
    const completeOtpSetup = vi.fn().mockResolvedValue({
      recoveryCodes: ['RCODE-1', 'RCODE-2'],
    })

    vi.mocked(useAuth).mockReturnValue({
      login,
      verifyOtp: vi.fn(),
      startOtpSetup,
      completeOtpSetup,
    })

    renderPage()

    await user.type(screen.getByLabelText(/Email address/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/^Password$/i), 'StrongPass123!')
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }))

    expect(await screen.findByText(/Two-Factor Verification/i)).toBeInTheDocument()
    expect(await screen.findByText(/Authenticator Setup/i)).toBeInTheDocument()
    expect(screen.getByText(/Risk level:/i)).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(startOtpSetup).toHaveBeenCalledWith('challenge-123', '')

    await user.type(screen.getByLabelText(/Authenticator code/i), '123456')
    await user.click(screen.getByRole('button', { name: /Verify and enable OTP/i }))

    expect(await screen.findByText(/Save Your Recovery Codes/i)).toBeInTheDocument()
    expect(screen.getByText('RCODE-1')).toBeInTheDocument()
    expect(screen.getByText('RCODE-2')).toBeInTheDocument()
    expect(completeOtpSetup).toHaveBeenCalledWith('123456', 'challenge-123', '')
  })
})
