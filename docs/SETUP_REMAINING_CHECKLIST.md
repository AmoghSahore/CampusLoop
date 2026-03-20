# CampusLoop Setup – Remaining Tasks Checklist

Use this checklist to finish environment + platform initialization before full testing.

## 1) Database Alignment

- [ ] Confirm active DB name in runtime env is `campusloop_db` (or update all SQL/env consistently if different).
- [ ] Verify current DB structure matches `docs/DB_STRUCTURE_CURRENT.md`.
- [ ] If needed, apply schema fixes in Aiven for missing tables/columns/constraints.

## 2) Backend Environment (`backend/.env`)

### CORS / App URL
- [ ] Set `FRONTEND_URL=http://localhost:5173,http://localhost:5174`.
- [ ] Confirm `PORT` is final and shared with both frontends via their `VITE_API_URL`.

### Secrets / Auth
- [ ] Set strong `JWT_SECRET`.
- [ ] Set strong `ADMIN_JWT_SECRET`.
- [ ] Set `JWT_EXPIRE` and `ADMIN_JWT_EXPIRE` as desired.

### OTP Controls
- [ ] Set `OTP_EXPIRE_MINUTES`.
- [ ] Set `OTP_MAX_ATTEMPTS`.
- [ ] Set `OTP_RESEND_COOLDOWN_SECONDS`.
- [ ] Set `OTP_MAX_RESENDS`.
- [ ] Set `STATUS_OTP_EXPIRE_MINUTES`.
- [ ] Set `STATUS_OTP_MAX_ATTEMPTS`.
- [ ] Set `STATUS_OTP_RESEND_COOLDOWN_SECONDS`.
- [ ] Set `STATUS_OTP_MAX_RESENDS`.

### SMTP (Email Delivery)
- [ ] Set `SMTP_HOST`.
- [ ] Set `SMTP_PORT`.
- [ ] Set `SMTP_SECURE`.
- [ ] Set `SMTP_USER`.
- [ ] Set `SMTP_PASS`.
- [ ] Set `SMTP_FROM`.
- [ ] Validate OTP email is delivered (not only console fallback).

### Rate Limits (IMPORTANT: actual keys used by code)
- [ ] Set `RL_AUTH_LOGIN_WINDOW_MS` and `RL_AUTH_LOGIN_MAX`.
- [ ] Set `RL_AUTH_VERIFY_WINDOW_MS` and `RL_AUTH_VERIFY_MAX`.
- [ ] Set `RL_AUTH_RESEND_WINDOW_MS` and `RL_AUTH_RESEND_MAX`.
- [ ] Set `RL_ADMIN_LOGIN_WINDOW_MS` and `RL_ADMIN_LOGIN_MAX`.
- [ ] Set `RL_STATUS_REQUEST_WINDOW_MS` and `RL_STATUS_REQUEST_MAX`.
- [ ] Set `RL_STATUS_CONFIRM_WINDOW_MS` and `RL_STATUS_CONFIRM_MAX`.

### Cloudinary
- [ ] Set `CLOUDINARY_CLOUD_NAME`.
- [ ] Set `CLOUDINARY_API_KEY`.
- [ ] Set `CLOUDINARY_API_SECRET`.
- [ ] Validate image upload and DB URL save.

## 3) Frontend Environment

### User Frontend (`frontend/.env`)
- [ ] Ensure `VITE_API_URL` points to backend base URL (example: `http://localhost:3000` or `http://localhost:5000`).

### Admin Frontend (`admin-frontend/.env`)
- [ ] Create file `admin-frontend/.env`.
- [ ] Set `VITE_API_URL` to same backend base URL.

## 4) Admin Seed + Table Consistency

- [ ] Resolve table mismatch before seeding (`admins` vs `admin_users`).
- [ ] Set `SEED_ADMIN_NAME`.
- [ ] Set `SEED_ADMIN_EMAIL`.
- [ ] Set `SEED_ADMIN_PASSWORD`.

## 5) Initialization Commands

- [ ] Run `npm run db:migrate`.
- [ ] Run `npm run db:seed:admin`.
- [ ] Start services (`backend`, `frontend`, `admin-frontend`).

## 6) Smoke Validation

- [ ] User signup + OTP email + verify + login.
- [ ] Listing create + image upload + status OTP completion.
- [ ] Wishlist add/remove/list.
- [ ] Report submit + admin review.
- [ ] Appeal submit + admin accept/reject.
- [ ] Admin login and moderation actions.

## 7) Security Cleanup (After Setup)

- [ ] Rotate exposed/temporary secrets (DB, JWT, SMTP, Cloudinary).
- [ ] Ensure `.env` files are not committed.
- [ ] Re-run smoke checks after secret rotation.
