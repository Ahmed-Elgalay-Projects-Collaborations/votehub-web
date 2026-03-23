// api.js
// Central API service layer — all backend calls go through here
// Uses HttpOnly cookie auth + CSRF token for mutating requests

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// ─── CSRF Token Cache ────────────────────────────────────────────────────────

let csrfToken = null

// ─── HTTP Helpers ────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(status, message, code, data = {}) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers: extraHeaders = {} } = options

  const headers = {
    ...extraHeaders,
  }

  // Add JSON content-type for requests with body
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Add CSRF token for mutating requests
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  })

  // Handle empty responses (e.g. 204)
  if (res.status === 204) return null

  const json = await res.json()

  if (!res.ok || json.success === false) {
    throw new ApiError(
      res.status,
      json.message || json.data?.message || 'Request failed',
      json.code || 'UNKNOWN_ERROR',
      json.data || {}
    )
  }

  return json.data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getCsrfToken() {
  const data = await request('/auth/csrf-token')
  csrfToken = data.csrfToken
  return csrfToken
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  })

  // If OTP is required, return the challenge info
  if (data.otpRequired) {
    return {
      otpRequired: true,
      otpSetupRequired: data.otpSetupRequired || false,
      otpChallengeToken: data.otpChallengeToken,
      riskLevel: data.riskLevel,
    }
  }

  // Normal login — store CSRF token
  if (data.csrfToken) {
    csrfToken = data.csrfToken
  }

  return { user: data.user }
}

export async function verifyLoginOtp(otpChallengeToken, otpCode, recoveryCode) {
  const body = { otpChallengeToken, otpCode }
  if (recoveryCode) body.recoveryCode = recoveryCode

  const data = await request('/auth/otp/verify-login', {
    method: 'POST',
    body,
  })

  if (data.csrfToken) {
    csrfToken = data.csrfToken
  }

  return { user: data.user }
}

export async function startOtpSetup(challengeToken) {
  const body = challengeToken ? { challengeToken } : {}
  return await request('/auth/otp/setup', {
    method: 'POST',
    body,
  })
}

export async function verifyOtpSetup(otpCode, challengeToken) {
  const body = { otpCode }
  if (challengeToken) body.challengeToken = challengeToken

  const data = await request('/auth/otp/verify-setup', {
    method: 'POST',
    body,
  })

  if (data.csrfToken) {
    csrfToken = data.csrfToken
  }

  return data
}

export async function disableOtp(currentPassword, otpCode, recoveryCode) {
  const body = { currentPassword, otpCode }
  if (recoveryCode) body.recoveryCode = recoveryCode

  return await request('/auth/otp/disable', {
    method: 'POST',
    body,
  })
}

export async function register(fullName, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { fullName, email, password },
  })

  return data // { user, message }
}

export async function verifyEmail(token) {
  return await request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function resendVerification(email) {
  return await request('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  })
}

export async function getMe() {
  const data = await request('/auth/me')
  return data.user
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' })
  csrfToken = null
}

// ─── Elections (Polls) ───────────────────────────────────────────────────────

export async function getPolls(includeArchived = false) {
  const params = includeArchived ? '?includeArchived=true' : ''
  const data = await request(`/elections${params}`)
  return data.elections
}

export async function getPoll(id) {
  const data = await request(`/elections/${id}`)
  return data.election
}

export async function createPoll(pollData) {
  const data = await request('/elections', {
    method: 'POST',
    body: pollData,
  })
  return data.election
}

export async function updatePoll(id, pollData) {
  const data = await request(`/elections/${id}`, {
    method: 'PATCH',
    body: pollData,
  })
  return data.election
}

export async function deletePoll(id) {
  const data = await request(`/elections/${id}`, {
    method: 'DELETE',
  })
  return data.election
}

export async function changeElectionStatus(id, status) {
  const data = await request(`/elections/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return data.election
}

// ─── Voting ──────────────────────────────────────────────────────────────────

export async function vote(electionId, optionIds) {
  const data = await request(`/elections/${electionId}/votes`, {
    method: 'POST',
    body: { optionIds: Array.isArray(optionIds) ? optionIds : [optionIds] },
  })
  return data // { vote, receipt }
}

export async function getResults(electionId) {
  const data = await request(`/elections/${electionId}/results`)
  return data.results
}

export async function getMyVotes() {
  const data = await request('/votes/me')
  return data.votes
}

export async function verifyVoteReceipt(receipt) {
  const data = await request('/votes/receipts/verify', {
    method: 'POST',
    body: { receipt },
  })
  return data.verification
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function adminStepUp(currentPassword, otpCode, recoveryCode) {
  const body = { currentPassword, otpCode }
  if (recoveryCode) body.recoveryCode = recoveryCode

  const data = await request('/auth/admin/step-up', {
    method: 'POST',
    body,
  })
  return data // { stepUpToken, expiresIn }
}

export { ApiError }
