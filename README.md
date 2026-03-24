# VoteHub Web

React + Vite frontend for VoteHub.

## Environment

Copy `.env.example` to `.env` (local only):

```bash
cp .env.example .env
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

Optional GitHub repository variable:
- `VITE_API_URL` (defaults to `/api/v1`)
