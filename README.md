# VoteHub Web

React + Vite frontend for VoteHub.

## Environment

Keep real env files outside the repo workspace.
Use a secure folder such as:

```powershell
C:\Users\Ahmed\.votehub-secrets
```

Create this file:

```powershell
C:\Users\Ahmed\.votehub-secrets\votehub-web.env
```

`vite.config.js` supports loading env files from an external directory via `VOTEHUB_WEB_ENV_DIR`.
Set it before running local dev:

```powershell
$env:VOTEHUB_WEB_ENV_DIR="$HOME\.votehub-secrets"
npm run dev
```

Main variable:
- `VITE_API_URL`
  - same-origin mode: `/api/v1`
  - split-domain mode: `https://api.votehub.example.com/api/v1`

## Local Development

```bash
npm install
npm run dev
```

## Docker

Development:

```bash
docker compose up --build
```

Production container (nginx + built static assets):

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Optional build-time API override:

```bash
VITE_API_URL=https://api.votehub.example.com/api/v1 docker compose -f docker-compose.prod.yml up --build -d
```

## Deployment Notes

- Frontend nginx includes `/nginx-health` for readiness checks.
- For same-origin deployment, frontend nginx proxies `/api/*` to `http://api:3100`.
- For split-domain deployment, set `VITE_API_URL` to the backend public URL and ensure backend CORS/cookie config allows the frontend origin.

## Security Notes

- Do not commit runtime `.env` files.
- TLS must be enforced in production.
- Keep backend cookie config aligned with deployment:
  - `COOKIE_SECURE=true`
  - `COOKIE_SAMESITE=none` for cross-site cookie flows

## Full Production Runbook

DigitalOcean + MongoDB Atlas end-to-end deployment is documented in backend repo:

- `votehub-api/DEPLOYMENT_DIGITALOCEAN_ATLAS.md`

Kubernetes (DOKS) frontend manifests are in:

- `votehub-web/k8s/digitalocean`

## Continuous Deployment (GitHub Actions)

This repo includes `.github/workflows/cd-digitalocean.yml`.
On push to `main`/`master`, it:
- runs lint + build
- builds and pushes `ghcr.io/<owner>/votehub-web`
- applies `k8s/digitalocean`
- updates deployment `web` image to immutable digest

Required GitHub repository secret:
- `DOKS_KUBECONFIG_B64` (base64 kubeconfig for the target DOKS cluster)
- `DIGITALOCEAN_ACCESS_TOKEN` (required when kubeconfig uses `exec` auth via `doctl`)

Optional GitHub repository variable:
- `VITE_API_URL` (defaults to `/api/v1`)

Optional GHCR override secrets:
- `GHCR_TOKEN` (PAT with `write:packages` + `read:packages`, SSO-authorized if org uses SAML)
- `GHCR_USERNAME` (username that owns `GHCR_TOKEN`)
