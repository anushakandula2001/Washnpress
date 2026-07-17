# Frontend

React UI for the WashNPress platform, built with Next.js 16 App Router, React 19, and Tailwind CSS v4.

## Folder structure

```
frontend/
└── docs/
    ├── Routing-Map.md         # Route → page mapping
    └── Component-Inventory.md # Shared component list

src/
├── app/                       # Next.js pages (file-based routing)
│   ├── page.tsx               # Mission dashboard
│   ├── login/                 # Auth UI
│   ├── resident/              # Resident portal
│   ├── operations/            # Operator dashboard
│   └── admin/                 # Admin console
├── components/
│   ├── ui/                    # Primitives (Button, Card, Badge…)
│   ├── resident/              # Shell, modals, provider
│   └── widgets/               # Dashboard widgets
├── frontend/
│   └── api-client.ts          # Typed fetch wrapper for backend APIs
└── lib/                       # Shared UI data & domain helpers
    ├── domain.ts
    ├── mock-data.ts
    ├── resident-data.ts
    └── types.ts
```

## Resident portal routes

| Route | Page |
|-------|------|
| `/resident` | Dashboard |
| `/resident/subscription` | Subscription management |
| `/resident/orders` | Order list & tracking |
| `/resident/pickup` | Schedule pickup |
| `/resident/wallet` | Wallet & transactions |
| `/resident/addons` | Add-on services |
| `/resident/impact` | Sustainability impact |
| `/resident/profile` | Profile settings |
| `/resident/support` | Support tickets |

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
```

## API integration

Pages fetch live data via `src/frontend/api-client.ts`. In development, resident APIs auto-authenticate as the demo user (`9876543210`) when no session cookie is set.
