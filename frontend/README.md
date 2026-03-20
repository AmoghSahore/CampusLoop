# CampusLoop User Frontend

This app is the main student-facing frontend for CampusLoop.

## Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Key variable:

- `VITE_API_URL` (default: `http://localhost:3001`)

## Notes

- This frontend depends on backend APIs under `/api/*`.
- Authentication and profile flows include email verification and appeal support.
- Listing completion actions use OTP confirmation through backend status endpoints.
