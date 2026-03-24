# VoteHub Web Security

## Overview
VoteHub Web is a React frontend that integrates with a security-focused backend using cookie-based JWT auth, CSRF tokens, OTP, risk-based login escalation, admin step-up tokens, and signed vote receipts. The frontend enforces safe rendering, protected navigation, defensive UX for sensitive actions, and secure handling of backend-driven security state.

## Implemented Frontend Security Features
- Cookie-auth + CSRF integration through a centralized API layer.
- Session anomaly event handling for invalid/expired authentication states.
- Protected routing for authenticated users and poll-creator permissions.
- Frame-embedding runtime guard to block app usage inside hostile iframes.
- Sensitive action confirmation modals for vote submission and poll lifecycle changes.
- Admin step-up UX for admin-protected poll actions (password + OTP/recovery code).
- OTP setup and disable UX in Settings.
- Recovery code display/copy workflow after OTP setup.
- Vote receipt display and verification UX after successful voting.
- Honeypot trap fields included in key forms to align with backend honeypot middleware.
- Visual trust indicators (email verification, 2FA status, secure admin context, receipt validation state).

## Route Protection and Security Flows
- `ProtectedRoute` blocks unauthenticated access until auth state is resolved.
- Poll builder routes (`/polls/create`, `/polls/:id/edit`) require poll-creator permission (`canCreatePolls` or admin role).
- Unauthorized protected-route access redirects safely without briefly rendering sensitive pages.
- Login supports backend OTP challenge flows, including OTP setup-required challenges.

## XSS-Related Protections
- No `dangerouslySetInnerHTML` or direct unsafe HTML insertion is used in app flows.
- User-generated fields (poll titles, descriptions, options, profile text shown in UI) are rendered as React text nodes.
- Frontend relies on React escaping for plain-text rendering; rich HTML rendering is not enabled.
- No `eval`/`new Function` usage in frontend source.

## Token and Session Handling
- Auth token is handled via HttpOnly cookie (backend-managed), not localStorage/sessionStorage.
- CSRF token is cached in memory and attached only to mutating requests.
- Logout clears frontend CSRF cache and local authenticated user state.
- API layer emits session-anomaly events on auth/security error codes; auth context reacts by clearing local user state.
- Session-alert messaging is stored in sessionStorage only for transient UX notices.

## Admin UI Protections
- Admin-sensitive poll actions use backend-supported one-time `X-Admin-Step-Up-Token`.
- Frontend step-up modal collects current password + OTP or recovery code.
- Admin security context is visible via trust indicators.
- Admin operations fail closed without step-up.

## Vote Flow Protections
- Vote submission uses explicit confirmation UX with summary before final submit.
- Duplicate vote and submission errors are handled with explicit user feedback.
- Idempotency key header is sent for vote submissions.
- Pending/submitted states are explicit in the UI.
- Signed receipt payload is shown after vote submission.
- Receipt verification endpoint is integrated in the success flow.

## OTP and Recovery UX Protections
- OTP setup can be initiated from login challenge flow and settings.
- QR + manual key display is available when backend returns enrollment payload.
- Recovery codes are surfaced once after setup and intended for secure offline storage.
- Copy actions for setup keys/recovery codes show explicit warnings before clipboard writes.
- Admin OTP disable is clearly blocked (backend policy), while non-admin disable flow is supported.

## CSP, Trusted Types, Clickjacking, and Honeypot
- Nginx CSP was tightened to remove `'unsafe-inline'` from `script-src` and add `form-action 'self'` + `font-src 'self'`.
- Frontend no longer depends on external Google Fonts.
- Backend `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` are complemented by frontend frame guard behavior.
- Honeypot form trap fields (`votehubTrap`) are wired to backend trap detection middleware.
- Trusted Types: no explicit Trusted Types policy is currently configured in the frontend.

## Security Limitations and Backend Dependencies
- Strict CSP compatibility is still limited by existing inline style usage (`style` props and style blocks in rendered components), so `style-src 'unsafe-inline'` is still required.
- Full Trusted Types enforcement is not yet implemented.
- Profile update, password change, and notification persistence endpoints are not currently exposed by backend APIs; related UI is read-only/client-local where applicable.
- Frontend security controls do not replace backend authorization, OTP enforcement, CSRF validation, or vote integrity checks.

## Backend vs Frontend Enforcement
- Backend is authoritative for authentication, authorization, CSRF validation, OTP policy, admin step-up validation, vote acceptance rules, and receipt cryptographic validation.
- Frontend provides secure UX, safe rendering defaults, navigation guards, action confirmation, and correct header/payload integration with backend security controls.
