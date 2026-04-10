## Sanitized Public Repository Notice

This repository is a sanitized public mirror of the internal frontend repository.
Sensitive material has been removed from files and history, including secrets, private credentials, and API keys.

---

# Mockline — Frontend

AI-powered fullstack IDE. Build, run, and iterate on backend services from the browser.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** strict mode
- **Tailwind CSS 4** + **shadcn/ui** (zinc, new-york style)
- **Feathers.js** over **Socket.io** for real-time API
- **Firebase** authentication (Google OAuth)
- **Monaco Editor** · **xterm.js** · **@xyflow/react**

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Requires a running backend at `http://localhost:3030` (see [backend repo](https://github.com/mockline-dev/backend)).

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
npx tsc --noEmit  # Type check
pnpm vitest       # Run tests
```

## Environment

| Variable                  | Default                 |
| ------------------------- | ----------------------- |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:3030` |
| `NEXT_PUBLIC_SOCKET_URL`  | `http://localhost:3030` |

Copy `.env.example` to `.env.local` and fill in Firebase credentials.

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── api/          # Server actions (Feathers REST calls)
├── containers/   # Stateful feature containers (workspace, auth, dashboard)
├── hooks/        # Shared custom hooks (primary state layer)
├── components/   # UI components (shadcn/ui + custom)
├── services/     # Feathers client, Firebase, error handling
├── types/        # TypeScript types (feathers.ts is source of truth)
└── config/       # Routes, endpoints, env, constants
```
