const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
export const SESSION_ANOMALY_EVENT = 'votehub:session-anomaly'

const SESSION_CLEAR_CODES = new Set(['TOKEN_INVALID', 'INVALID_TOKEN_CONTEXT', 'AUTH_REQUIRED'])
const SESSION_ANOMALY_CODES = new Set([
  'TOKEN_INVALID',
  'INVALID_TOKEN_CONTEXT',
  'AUTH_REQUIRED',
  'EMAIL_NOT_VERIFIED',
  'RISK_BLOCKED',
  'ADMIN_STEP_UP_REQUIRED',
])

let csrfToken = null

class ApiError extends Error {
  constructor(status, message, code, data = {}) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

function emitSessionAnomaly(detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SESSION_ANOMALY_EVENT, { detail }))
}

function buildSecurityHeaders(security = {}) {
  const headers = {}
  if (security.adminStepUpToken) {
    headers['X-Admin-Step-Up-Token'] = security.adminStepUpToken
  }
  if (security.idempotencyKey) {
    headers['Idempotency-Key'] = security.idempotencyKey
  }
  return headers
}

async function parseResponseBody(res) {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return await res.json()
  }

  const text = await res.text()
  return {
    success: res.ok,
    message: text || null,
    data: null,
  }
}

async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    security = {},
  } = options

  const headers = {
    ...extraHeaders,
    ...buildSecurityHeaders(security),
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  })

  if (res.status === 204) return null

  const json = await parseResponseBody(res)
  const status = res.status
  const code = json?.code || json?.error?.code || 'UNKNOWN_ERROR'
  const message = json?.message || json?.error?.message || json?.data?.message || 'Request failed'
  const data = json?.data || json?.error?.details || {}

  if (!res.ok || json?.success === false) {
    if (status === 401 || SESSION_CLEAR_CODES.has(code)) {
      csrfToken = null
    }

    if ((status === 401 || status === 403) && SESSION_ANOMALY_CODES.has(code)) {
      emitSessionAnomaly({ status, code, message })
    }

    throw new ApiError(status, message, code, data)
  }

  return json.data
}

export function clearApiSessionState() {
  csrfToken = null
}

export async function getCsrfToken() {
  const data = await request('/auth/csrf-token')
  csrfToken = data.csrfToken
  return csrfToken
}

export async function login(email, password, votehubTrap = '') {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password, votehubTrap },
  })

  if (data.otpRequired) {
    return {
      otpRequired: true,
      otpSetupRequired: data.otpSetupRequired || false,
      otpChallengeToken: data.otpChallengeToken,
      riskLevel: data.riskLevel,
    }
  }

  if (data.csrfToken) {
    csrfToken = data.csrfToken
  }

  return { user: data.user }
}

export async function verifyLoginOtp(otpChallengeToken, otpCode, recoveryCode, votehubTrap = '') {
  const body = { otpChallengeToken, votehubTrap }
  if (otpCode) body.otpCode = otpCode
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

export async function startOtpSetup(challengeToken, votehubTrap = '') {
  const body = challengeToken ? { challengeToken, votehubTrap } : { votehubTrap }
  return await request('/auth/otp/setup', {
    method: 'POST',
    body,
  })
}

export async function verifyOtpSetup(otpCode, challengeToken, votehubTrap = '') {
  const body = { otpCode, votehubTrap }
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

export async function disableOtp(currentPassword, otpCode, recoveryCode, votehubTrap = '') {
  const body = { currentPassword, votehubTrap }
  if (otpCode) body.otpCode = otpCode
  if (recoveryCode) body.recoveryCode = recoveryCode

  return await request('/auth/otp/disable', {
    method: 'POST',
    body,
  })
}

export async function register(fullName, email, password, votehubTrap = '') {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { fullName, email, password, votehubTrap },
  })

  return data
}

export async function verifyEmail(token) {
  return await request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function resendVerification(email, votehubTrap = '') {
  return await request('/auth/resend-verification', {
    method: 'POST',
    body: { email, votehubTrap },
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

export async function getPolls(includeArchived = false) {
  const params = includeArchived ? '?includeArchived=true' : ''
  const data = await request(`/elections${params}`)
  return data.elections
}

export async function getPoll(id) {
  const data = await request(`/elections/${id}`)
  return data.election
}

export async function createPoll(pollData, security = {}) {
  const data = await request('/elections', {
    method: 'POST',
    body: pollData,
    security,
  })
  return data.election
}

export async function updatePoll(id, pollData, security = {}) {
  const data = await request(`/elections/${id}`, {
    method: 'PATCH',
    body: pollData,
    security,
  })
  return data.election
}

export async function deletePoll(id, security = {}) {
  const data = await request(`/elections/${id}`, {
    method: 'DELETE',
    security,
  })
  return data.election
}

export async function changeElectionStatus(id, status, security = {}) {
  const data = await request(`/elections/${id}/status`, {
    method: 'PATCH',
    body: { status },
    security,
  })
  return data.election
}

export async function vote(electionId, optionIds, security = {}, votehubTrap = '') {
  const data = await request(`/elections/${electionId}/votes`, {
    method: 'POST',
    body: {
      optionIds: Array.isArray(optionIds) ? optionIds : [optionIds],
      votehubTrap,
    },
    security,
  })
  return data
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

export async function adminStepUp(currentPassword, otpCode, recoveryCode, votehubTrap = '') {
  const body = { currentPassword, votehubTrap }
  if (otpCode) body.otpCode = otpCode
  if (recoveryCode) body.recoveryCode = recoveryCode

  const data = await request('/auth/admin/step-up', {
    method: 'POST',
    body,
  })
  return data
}

export { ApiError }
