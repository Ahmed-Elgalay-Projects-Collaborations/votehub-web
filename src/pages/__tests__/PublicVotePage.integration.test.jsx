import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PublicVotePage from '../PublicVotePage'
import { usePoll } from '../../hooks/usePoll'
import { useAuth } from '../../hooks/useAuth'
import { verifyVoteReceipt, vote } from '../../services/api'

vi.mock('../../hooks/usePoll', () => ({
  usePoll: vi.fn(),
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  vote: vi.fn(),
  verifyVoteReceipt: vi.fn(),
}))

const POLL_FIXTURE = {
  _id: '123',
  type: 'poll',
  title: 'Best frontend framework?',
  description: 'Select one option.',
  maxSelections: 1,
  options: [
    { _id: 'opt-1', label: 'React' },
    { _id: 'opt-2', label: 'Vue' },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/vote/123']}>
      <Routes>
        <Route path="/vote/:id" element={<PublicVotePage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicVotePage (integration)', () => {
  beforeEach(() => {
    vi.mocked(usePoll).mockReturnValue({
      poll: POLL_FIXTURE,
      loading: false,
      error: null,
    })
  })

  it('keeps voting disabled for unauthenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null })

    renderPage()

    expect(screen.getByText(/Sign-in required to vote/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Review and Submit Vote/i })).toBeDisabled()
  })

  it('submits a vote with idempotency key and verifies signed receipt', async () => {
    const user = userEvent.setup()
    const receipt = {
      payload: {
        voteId: 'vote-001',
        recordedAt: '2026-03-24T10:00:00.000Z',
        integrityHash: 'abc123',
      },
      signature: 'signed-payload',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u1',
        role: 'voter',
        otpEnabled: true,
      },
    })
    vi.mocked(vote).mockResolvedValue({ receipt })
    vi.mocked(verifyVoteReceipt).mockResolvedValue({ valid: true })

    renderPage()

    await user.click(screen.getByRole('button', { name: 'React' }))
    await user.click(screen.getByRole('button', { name: /Review and Submit Vote/i }))
    expect(screen.getByText(/Confirm Vote Submission/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Submit Vote$/i }))

    await waitFor(() => {
      expect(vote).toHaveBeenCalledTimes(1)
    })

    const [electionId, optionIds, security, votehubTrap] = vi.mocked(vote).mock.calls[0]
    expect(electionId).toBe('123')
    expect(optionIds).toEqual(['opt-1'])
    expect(typeof security.idempotencyKey).toBe('string')
    expect(votehubTrap).toBe('')

    expect(await screen.findByText(/Vote Recorded/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Signed Receipt/i, level: 3 })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Verify receipt signature/i }))

    await waitFor(() => {
      expect(verifyVoteReceipt).toHaveBeenCalledWith(receipt)
    })
    expect(await screen.findByText(/Receipt verified/i)).toBeInTheDocument()
  })
})
