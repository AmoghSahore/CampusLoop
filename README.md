# CampusLoop

CampusLoop is a campus marketplace for students to buy, sell, rent, and donate items with safer peer-to-peer workflows.

## Project Structure

| App | Path | Tech | Default Port |
| --- | --- | --- | --- |
| User Frontend | `frontend/` | React + Vite | `5173` |
| Admin Frontend | `admin-frontend/` | React + Vite | `5174` |
| Backend API | `backend/` | Node.js + Express + MySQL | `3001` |

## Core Features

- User authentication with email verification OTP
- Product listings (sell/rent/donate) with image upload and management
- Wishlist persistence for authenticated users
- Buyer-seller chat per listing
- Report and appeal workflows
- Admin moderation console (users/products/reports/appeals/logs/dashboard)
- Listing completion OTP for `SOLD` and `DONATED`
- Green credits on completed listing transitions

## Prerequisites

- Node.js 18+
- MySQL database (or managed MySQL-compatible service)

## Setup

### 1) Install dependencies

```bash
npm run install-all
```

### 2) Configure environment files

Create these files from examples:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`
- `admin-frontend/.env` from `admin-frontend/.env.example`

### 3) Initialize database

Run migrations and seed admin:

```bash
npm run db:migrate
npm run db:seed:admin
```

Or run backend setup in one command:

```bash
npm run setup:backend
```

## Run the Project

### Run all apps together

```bash
npm run dev
```

### Run apps separately

```bash
npm run backend
npm run frontend
npm run admin-frontend
```

## Build

Build both frontends:

```bash
npm run build
```

## Helpful Docs

- `docs/SETUP.md` for full setup steps
- `docs/DB_STRUCTURE_CURRENT.md` for current database structure
- `docs/SETUP_REMAINING_CHECKLIST.md` for pending setup checklist
