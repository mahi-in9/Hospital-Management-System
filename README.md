# Hospital Management System (HMS)

A multi-tenant, cloud-enabled Hospital Management System built with MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

![Lint CI](https://github.com/mahi-in9/Hospital-Management-System/actions/workflows/lint.yml/badge.svg)

## Features

- ✅ Multi-tenant architecture with schema-per-tenant database isolation
- ✅ Role-Based Access Control (RBAC) with hierarchical roles
- ✅ Attribute-Based Access Control (ABAC) for fine-grained permissions
- ✅ Hospital self-registration with email verification
- ✅ User management with password policies and history tracking
- ✅ Patient management (OPD/IPD) with search and filtering
- ✅ Prescription management with multi-medicine support and templates
- ✅ JWT-based authentication with access/refresh tokens
- ✅ Session management with Redis
- ✅ Responsive UI with Tailwind CSS
- ✅ Production-ready error handling and logging

## Tech Stack

### Backend

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose ORM
- **Caching**: Redis 7.x
- **Authentication**: JWT + Passport.js
- **Validation**: Joi
- **Email**: Nodemailer
- **Logging**: Winston + Morgan

### Frontend

- **Framework**: React v18+ with Vite
- **Routing**: React Router v6+
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts
- **Export**: jsPDF, xlsx

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB and Redis credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` for the frontend and API is on `http://localhost:5000/api`

## Project Structure

```
Hospital-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (DB, Redis, env)
│   │   ├── middleware/      # Express middleware (auth, tenant, RBAC)
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── redux/
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## Key Features Implemented

### Authentication & Authorization

- Hospital self-registration with license validation
- Email verification workflow
- JWT token generation (1h access, 7d refresh)
- Session management with Redis
- Password policies and history tracking

### Multi-Tenancy

- Schema-per-tenant database isolation
- Redis namespacing: `tenant:{tenantId}:*`
- Tenant context validation on all protected routes
- Cross-tenant data access prevention

### Role-Based Access Control

- Hierarchical roles: SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST
- Permission-based authorization: `RESOURCE:ACTION`
- Custom role support with many-to-many permissions

### Patient Management

- OPD/IPD patient types
- Patient search by ID, name, phone, email
- Filtering by type, department, doctor, date range
- Pagination (20 records per page)
- Photo upload support

### Prescription Management

- Multi-medicine prescriptions
- Medicine details: Name, Dosage, Frequency, Duration, Instructions
- Prescription templates for reusable recipes
- Dispensing workflow (Doctor → Pharmacist)

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth Routes

- `POST /api/auth/register-hospital` - Register hospital
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/protected/auth/logout` - Logout (protected)

## Testing the Application

1. **Register Hospital**: Go to `/register-hospital`, fill form, submit
2. **Verify Email**: Check verification link (in demo, shown in response)
3. **Login**: Use admin credentials provided during registration
4. **Access Dashboard**: After login, view hospital dashboard

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, create an issue in the repository.
