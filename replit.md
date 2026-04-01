# Workspace

## Overview

pnpm workspace monorepo — **Apex Moto** Powersport Marketplace. A premium, mobile-first platform focused on quad bikes (ATVs) and powersport machines. Features a futuristic dark UI, 3D model viewer, WhatsApp integration, admin dashboard, and full CRUD. Primary category is Quad Bikes / ATVs.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, React Three Fiber / Three.js
- **API framework**: Express 5
- **Database**: Neon PostgreSQL (serverless) + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Session-based (express-session, SHA-256 password hash)
- **File storage**: Supabase Storage (bucket: `uploads`, public CDN URLs)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/       # Express API server
│   └── bike-marketplace/ # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/         # OpenAPI spec + Orval codegen
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/          # Generated Zod schemas
│   └── db/               # Drizzle ORM schema + DB connection
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

### Public (no login required)
- Homepage: hero, featured vehicles carousel, category grid (Superbike, Naked Bike, Scooter, Maxi-Scooter, Quad Bike/ATV, Electric, Adventure, Sport Tourer)
- Product listing: filterable/searchable grid
- Product detail: image gallery, specs, 3D model viewer (React Three Fiber), WhatsApp CTA
- Contact/Request form → stored in DB

### Admin (session-protected)
- Login: POST /api/admin/login (email: admin@powersport.com / password: admin123)
- Dashboard: stats, recharts activity + category charts
- Product management: full CRUD, featured toggle, image/3D upload fields
- Request management: filter, status updates (pending/contacted/resolved)
- Profile settings: WhatsApp number, social links

## Database Tables

- `products` — vehicles (id, name, brand, price, category, description, engineCapacity, topSpeed, images[], model3dUrl, featured, specs jsonb)
- `requests` — user interest submissions (id, name, email, phone, location, bikeId, bikeName, message, status)
- `admin_profile` — admin account (id, name, email, phone, passwordHash, whatsappNumber, socialLinks jsonb)

## API Routes

All routes prefixed with `/api`

- `GET/POST /products` — list/create
- `GET/PUT/DELETE /products/:id` — single product
- `GET /products/featured` — featured list
- `GET /products/categories` — category counts
- `GET /products/brands` — brand list
- `GET /products/:id/related` — related products
- `GET/POST /requests` — list/create
- `GET/PATCH/DELETE /requests/:id` — single request
- `POST /admin/login` — login
- `POST /admin/logout` — logout
- `GET /admin/me` — current session
- `GET/PUT /admin/profile` — profile
- `GET /stats/dashboard` — overview stats
- `GET /stats/activity` — time-series chart data

## Seed Data

Seeded with 8 premium quad bike / ATV vehicles (Yamaha Raptor, Honda TRX450R, Polaris Sportsman, Kawasaki KFX, Can-Am Outlander, etc.)

**Admin credentials:**
- Email: admin@apexmoto.com
- Password: Admin@2024!
- Admin can change email and password anytime from the admin dashboard → System Configuration page.

## Environment Variables

Required env vars (see `.env.example` for details):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — Long random string for session signing
- `NODE_ENV` — set to `production` for deployment
- `SUPABASE_URL` — Supabase project URL (for file/image uploads only)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (for file/image uploads only)
- `VITE_API_URL` — Public URL of the API server (required in production when frontend and backend are on separate domains)

## Database Setup

Run schema migrations (creates tables):
```
pnpm --filter @workspace/db run push
```

## Render Deployment

- API server: Web Service — build `pnpm install && pnpm --filter @workspace/api-server run build`, start `pnpm --filter @workspace/api-server run start`
- Frontend: Static Site — build `pnpm install && pnpm --filter @workspace/bike-marketplace run build`, publish dir `artifacts/bike-marketplace/dist`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. All routes in `src/routes/`. Uses Drizzle + sessions.

### `artifacts/bike-marketplace` (`@workspace/bike-marketplace`)

React + Vite frontend. Dark futuristic theme. Three.js 3D viewer. Framer Motion animations. Recharts for admin charts.

### `lib/db` (`@workspace/db`)

Schema: `products.ts`, `requests.ts`, `admin.ts`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec at `openapi.yaml`. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
