# CampusLoop - Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Git

## Initial Setup (First Time Only)

### 1. Clone the Repository
```bash
git clone https://github.com/your-team/campusloop.git
cd campusloop
```

### 2. Install Dependencies
```bash
# Install all dependencies (backend + frontend + admin-frontend)
npm run install-all

# OR install separately
cd backend && npm install
cd ../frontend && npm install
cd ../admin-frontend && npm install
```

### 3. Setup Environment Variables

**IMPORTANT:** Get the `.env` files from your team lead (NOT in Git!)

#### Backend (.env)
Copy the `.env` file you received into `backend/` folder:
```bash
# Place the .env file here
backend/.env
```

OR create from template:
```bash
cd backend
cp .env.example .env
# Edit .env with actual values
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit if needed (usually defaults are fine)
```

#### Admin Frontend (.env)
```bash
cd admin-frontend
cp .env.example .env
# Edit if needed (usually defaults are fine)
```

### 4. Setup Database

#### Option A: Manual Setup (Recommended)
```bash
# Run schema + pending migrations from root
npm run db:migrate

# Seed/update initial admin account (uses backend/.env)
npm run db:seed:admin
```

#### Option B: Using Database Client
- Open MySQL Workbench / phpMyAdmin / DBeaver
- Execute `database/schema.sql`

#### Option C: Backend One-Command Setup
```bash
npm run setup:backend
```
This runs migration and admin seed in sequence.

### 5. Start Development Servers

#### Run All (Backend + User Frontend + Admin Frontend)
```bash
# From root directory
npm run dev
```

#### Run Separately
```bash
# Backend only (Terminal 1)
npm run backend

# Frontend only (Terminal 2)
npm run frontend

# Admin frontend only (Terminal 3)
npm run admin-frontend
```

### 6. Access the Application
- **Frontend:** http://localhost:5173
- **Admin Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3001

## Common Issues

### "Cannot connect to database"
- Check if MySQL is running: `mysql.server status`
- Verify credentials in `backend/.env`
- Check if database exists: `SHOW DATABASES;`

### "Module not found"
- Delete `node_modules` and reinstall:
```bash
  rm -rf node_modules package-lock.json
  npm install
```

### "Port already in use"
- Backend (3001): Change `PORT` in `backend/.env`
- Frontend (5173): Kill process on port or change in `vite.config.js`
- Admin frontend (5174): Kill process on port or change in `admin-frontend/package.json`

## Environment Variables

### Backend Environment Variables
See `backend/.env.example` for all required variables.

**Critical Variables:**
- `DB_PASSWORD`: Your MySQL password
- `JWT_SECRET`: Secret key for authentication (must be same for all team members)
- `ADMIN_JWT_SECRET`: Secret key for admin login tokens
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`: required to create/update initial admin

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

### Admin Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Team Workflow

### Getting Latest Changes
```bash
git pull origin main
npm run install-all  # In case new dependencies were added
```

### Before Committing
```bash
# Make sure .env is NOT staged
git status

# If .env shows up:
git reset HEAD backend/.env
git reset HEAD frontend/.env
```

## Need Help?
Contact [Team Lead Name] or create an issue in GitHub.