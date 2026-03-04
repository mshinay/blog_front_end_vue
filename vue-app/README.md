# vue-app

Parallel Vue rewrite for the legacy static blog front-end.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
npm run lint:fix
```

## Test

```bash
npm run test
npm run test:watch
npm run test:one -- tests/auth.store.spec.ts
npm run test:name -- "auth store"
```

## Environment

- `.env.development`
- `.env.example`

Required variable:

- `VITE_API_BASE_URL` (default: `http://localhost:8080`)
