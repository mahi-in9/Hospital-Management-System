# Hospital Management System - Setup Guide

## Prerequisites

- Node.js v20+ installed
- MongoDB (local or Atlas account)
- Redis (local or cloud instance)
- Git

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# The .env file is already created, but verify these settings:
# - MONGODB_URI: MongoDB connection string
# - REDIS_HOST and REDIS_PORT: Redis connection details
# - JWT secrets and expiry times
```

**Backend runs on:** `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies with legacy peer deps (required for React 18 with Redux Toolkit)
npm install --legacy-peer-deps

# The .env file is already created with:
# VITE_API_URL=http://localhost:5000/api
```

**Frontend runs on:** `http://localhost:5173`

## Running the Application

### Option 1: Run Both Backend and Frontend

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Then open browser: `http://localhost:5173`

### Option 2: Production Build

**Build frontend:**

```bash
cd frontend
npm run build
# Output in dist/ folder
```

**Run backend:**

```bash
cd backend
npm start
```

## Features Ready to Use

### 1. Hospital Registration

- Navigate to `/register-hospital`
- Fill in hospital details
- Receive temporary admin credentials
- Email verification link (shown in response)

### 2. User Login

- Navigate to `/login`
- Enter email and password
- JWT tokens stored in localStorage
- Automatic token refresh on expiry

### 3. Dashboard

- Post-login dashboard with overview widgets
- Role-based access control enforced
- Multi-tenant isolation at API level

## API Endpoints

### Public (No Authentication Required)

```
POST /api/auth/register-hospital
POST /api/auth/verify-email
POST /api/auth/login
POST /api/auth/refresh-token
GET  /api/health
```

### Protected (Requires JWT Token)

```
POST /api/protected/auth/logout
```

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## Testing the Application

### 1. Test Hospital Registration

- Go to `http://localhost:5173/register-hospital`
- Fill in form:
  - Hospital Name: "Test Hospital"
  - Domain: "test-hospital"
  - License Number: "LIC-001"
  - Admin Email: "admin@test.com"
  - All other fields as needed
- Submit and note the credentials

### 2. Test Login

- Go to `http://localhost:5173/login`
- Use the admin email from registration
- Use temporary password from registration response
- Successfully logs in to dashboard

### 3. Verify Multi-Tenancy

- Register another hospital with different domain
- Both hospitals have isolated data
- Tokens contain `tenantId`
- API validates tenant context

## Development Notes

### Code Structure

**Backend:**

- `src/config/` - Database, Redis, environment configs
- `src/middleware/` - Tenant validation, RBAC, authentication
- `src/models/` - Mongoose schemas (Hospital, User, Patient, Prescription)
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/utils/` - Logger, error classes, ID generation

**Frontend:**

- `src/redux/` - Redux store and slices
- `src/api/` - Axios client with interceptors
- `src/pages/` - Page components (Login, RegisterHospital, Dashboard)
- `src/components/` - Reusable components
- `src/utils/` - Utility functions

### Styling

- Uses Tailwind CSS with custom color palette
- Primary colors: Blues (primary-50 to primary-900)
- Secondary colors: Grays (secondary-50 to secondary-900)
- Custom component classes: `.btn-primary`, `.input-field`, `.card`, `.table-th`, `.table-td`

### Authentication Flow

1. User registers hospital → Auto-creates admin user
2. Admin verifies email
3. Admin logs in with credentials
4. System generates JWT tokens (access + refresh)
5. Tokens stored in localStorage
6. All API calls include Authorization header
7. Token refresh happens automatically on 401

## Common Issues & Solutions

### Issue: MongoDB Connection Refused

**Solution:**

- Start MongoDB locally: `mongod`
- Or update MONGODB_URI in .env to Atlas connection string

### Issue: Redis Connection Refused

**Solution:**

- Start Redis locally: `redis-server`
- Or update REDIS_HOST and REDIS_PORT in .env

### Issue: Port 5000 Already in Use

**Solution:**

- Change PORT in backend .env
- Update VITE_API_URL in frontend .env accordingly

### Issue: Frontend npm install fails

**Solution:**

- Use `npm install --legacy-peer-deps` (already documented above)

## Next Steps to Complete

1. **Patient Management APIs**

   - Patient CRUD endpoints
   - Search and filtering
   - OPD/IPD type management

2. **Prescription Management APIs**

   - Prescription creation with multi-medicines
   - Template support
   - Dispensing workflow

3. **User Management APIs**

   - Create users with roles
   - Password management
   - Permission assignment

4. **Frontend Pages**
   - Patient list and search
   - Patient creation form
   - Prescription management
   - User management

## Architecture Highlights

### Multi-Tenancy

- Schema-per-tenant database isolation
- Redis namespacing: `tenant:{tenantId}:*`
- Every API query filtered by tenantId
- JWT contains tenantId claim

### Security

- Password hashing with bcryptjs
- Password history (can't reuse last 3)
- JWT tokens with expiry
- Session invalidation on password change
- CORS configured for frontend

### RBAC Implementation

- Roles: SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST
- Permissions: RESOURCE:ACTION format
- Role hierarchy with permission inheritance

## Support

For issues or questions, check the main README.md or the Copilot instructions in `.github/copilot-instructions.md`.

---

**Ready to develop!** 🚀
