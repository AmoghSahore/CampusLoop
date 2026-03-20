# CampusLoop

CampusLoop is a campus marketplace focused on reuse and safe peer-to-peer exchange for students.

## Current Architecture

- `frontend/` — user app (React + Vite, port `5173`)
- `admin-frontend/` — separate admin console (React + Vite, port `5174`)
- `backend/` — API server (Node.js + Express + MySQL, port `3001`)

## Implemented Core Features

- User signup/login with email verification OTP
- Product listings (sell/rent/donate), image upload, and listing management
- Wishlist persistence (server-backed for authenticated users)
- Chat messaging between buyer and seller per product
- Reporting + appeals flow
- Admin moderation console:
	- reports/appeals review
	- user and product moderation
	- admin action logs
	- KPI dashboard + deep-linked filters + bulk actions
- Listing completion OTP flow for `SOLD` / `DONATED` status confirmation
- Green credits awarded on completed listing transitions

## Quick Start

1. Install all dependencies:

```bash
npm run install-all
```

2. Configure environment files from templates:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`
- `admin-frontend/.env` from `admin-frontend/.env.example`

3. Initialize DB using schema + migrations in `database/`.

```bash
npm run db:migrate
npm run db:seed:admin
```

Or run both in one step:

```bash
npm run setup:backend
```

4. Run all apps:

```bash
npm run dev
```

For detailed setup steps, see `docs/SETUP.md`.
