// api.js
// Central API service layer — all backend calls go here
// Currently returns MOCKED data. When backend is ready, replace internals only.
// All requests use credentials: 'include' for HttpOnly cookie support

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: '1',
  name: 'Ahmed Elgalay',
  email: 'ahmed@votehub.com',
  avatar: null,
}

const MOCK_POLLS = [
  {
    id: '1',
    title: 'Best JS Framework 2025',
    type: 'multiple-choice',
    status: 'active',
    voteCount: 142,
    createdAt: '2025-03-10T10:00:00Z',
    deadline: '2025-03-20T23:59:00Z',
    options: ['React', 'Vue', 'Angular', 'Svelte'],
  },
  {
    id: '2',
    title: 'Should we switch to dark mode by default?',
    type: 'yes-no',
    status: 'active',
    voteCount: 87,
    createdAt: '2025-03-12T09:00:00Z',
    deadline: '2025-03-18T23:59:00Z',
    options: ['Yes', 'No'],
  },
  {
    id: '3',
    title: 'Rate our onboarding experience',
    type: 'rating',
    status: 'closed',
    voteCount: 230,
    createdAt: '2025-03-01T08:00:00Z',
    deadline: '2025-03-08T23:59:00Z',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: '4',
    title: 'Team lunch spot this Friday',
    type: 'multiple-choice',
    status: 'draft',
    voteCount: 0,
    createdAt: '2025-03-14T14:00:00Z',
    deadline: null,
    options: ['Pizza Palace', 'Sushi Garden', 'Burger Barn'],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getMe() {
  await delay()
  return MOCK_USER
  // Real: return fetch(`${BASE_URL}/auth/me`, { credentials: 'include' }).then(r => r.json())
}

export async function login(email, password) {
  await delay()
  return { user: MOCK_USER }
  // Real: return fetch(`${BASE_URL}/auth/login`, { method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) }).then(r => r.json())
}

export async function register(name, email, password) {
  await delay()
  return { user: MOCK_USER }
}

export async function logout() {
  await delay()
  return {}
}

// ─── Polls ────────────────────────────────────────────────────────────────────

export async function getPolls() {
  await delay()
  return MOCK_POLLS
}

export async function getPoll(id) {
  await delay()
  return MOCK_POLLS.find(p => p.id === id) || null
}

export async function createPoll(data) {
  await delay()
  return { ...data, id: String(Date.now()), voteCount: 0, createdAt: new Date().toISOString() }
}

export async function updatePoll(id, data) {
  await delay()
  return { id, ...data }
}

export async function deletePoll(id) {
  await delay()
  return { success: true }
}

// ─── Voting ───────────────────────────────────────────────────────────────────

export async function vote(pollId, optionIndex) {
  await delay()
  return { success: true }
}

export async function getResults(pollId) {
  await delay()
  const poll = MOCK_POLLS.find(p => p.id === pollId)
  if (!poll) return null
  return {
    pollId,
    title: poll.title,
    totalVotes: poll.voteCount,
    options: poll.options.map((label, i) => ({
      label,
      votes: Math.floor(Math.random() * poll.voteCount),
    })),
  }
}
