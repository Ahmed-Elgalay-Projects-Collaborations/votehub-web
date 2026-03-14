# VoteHub-Web

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Docker

This project includes two Docker Compose setups:

1. Development (default): `docker-compose.yml`
2. Production: `docker-compose.prod.yml`

### Development (default)

```bash
docker compose up --build
```

App URL: `http://localhost:5173`

### Production

```bash
docker compose -f docker-compose.prod.yml up --build
```

This runs a build-only container and writes the static output to `dist/` (Netlify-style workflow, no app server).

### Stop containers

```bash
docker compose down
docker compose -f docker-compose.prod.yml down
```
