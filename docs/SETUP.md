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
# Install all dependencies (frontend + backend)
npm run install-all

# OR install separately
cd backend && npm install
cd ../frontend && npm install
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

### 4. Setup Database

#### Option A: Manual Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
mysql -u root -p < database/schema.sql
```

#### Option B: Using Database Client
- Open MySQL Workbench / phpMyAdmin / DBeaver
- Execute `database/schema.sql`

### 5. Start Development Servers

#### Run Both (Frontend + Backend)
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
```

### 6. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/docs (if implemented)

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
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (5173): Kill process on port or change in `vite.config.js`

## Environment Variables

### Backend Environment Variables
See `backend/.env.example` for all required variables.

**Critical Variables:**
- `DB_PASSWORD`: Your MySQL password
- `JWT_SECRET`: Secret key for authentication (must be same for all team members)

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

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