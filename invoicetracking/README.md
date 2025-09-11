# FactureFlow - Invoice Tracking (Frontend)

A modern React-based invoice tracking frontend designed to work with a Django REST Framework backend (with SimpleJWT and optional Channels for realtime).

## 🚀 Current Status

### Frontend
- ✅ Auth wired to Django endpoints (SimpleJWT): login, refresh, me, logout, register
- ✅ Axios client with JWT interceptors and automatic refresh
- ✅ Vite dev proxy `/api` → Django (`http://localhost:8000` by default)
- ✅ i18n (English/French) with JSON translation files
- ✅ Dark/Light theme with persistence (Tailwind `dark` mode)
- ✅ Settings panel (language + theme)
- ✅ Dashboard with permission-aware cards
- ✅ Realtime socket client scaffold (WebSocket) for invoice/notification events
- ✅ OCR upload UI + ingest status checks
- ✅ Notifications panel (list + mark-as-read)

### Backend (expected, integrate your Django project)
- 🚧 Django REST Framework + SimpleJWT
- 🚧 CORS configured for Vite origin
- 🚧 Endpoints listed below (the frontend already calls these)

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

### Backend (Recommended)
- **Python 3.11+**
- **Django + DRF**
- **MySQL/PostgreSQL**
- **djangorestframework-simplejwt**
- **django-channels** (for realtime)
- **Celery + Redis** (OCR/ML tasks)
- **django-cors-headers**

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd invoicetracking

# Install dependencies
npm install

# Start development server
npm run dev
```

### Notes
- React, Tailwind, and tooling are installed via `npm install`.

## 🎯 Features

### Current Features
- ✅ **User Authentication**
  - Login with email/password
  - User registration
  - Session persistence (localStorage)
  - Logout functionality

- ✅ **Role-Based Access Control**
  - Admin, Manager, Employee, Viewer roles
  - Granular permissions system
  - Permission-based UI rendering

- ✅ **User Management**
  - User profiles with avatars
  - Service/department assignment
  - Last login tracking

- ✅ **Demo Accounts**
  - Pre-configured test users
  - Different permission levels
  - Easy testing and demonstration

### In Progress / Next
- Backend integration of OCR pipeline and ML scoring
- Realtime invoice updates via Channels
- Export (PDF/XLSX) endpoints and UI
- Backups, audit log viewer, reports & analytics

## 🔗 API endpoints expected by the frontend

Auth and Users
- POST `/api/auth/jwt/create/` (login)
- POST `/api/auth/jwt/refresh/`
- GET `/api/auth/me/`
- POST `/api/auth/register/`
- POST `/api/auth/logout/`

Invoices
- GET `/api/invoices/` (supports filters & pagination)
- GET `/api/invoices/:id/`
- POST `/api/invoices/`
- PATCH `/api/invoices/:id/`
- POST `/api/invoices/:id/approve/` | `/reject/`
- GET `/api/invoices/:id/history/`
- GET `/api/invoices/:id/attachments/` | POST `/attachments/`

Notifications
- GET `/api/notifications/`
- PATCH `/api/notifications/:id/` (read/archive)

OCR / Ingest
- POST `/api/ingest/upload/` (multipart)
- GET `/api/ingest/:jobId/` (status)

Realtime
- WebSocket `ws://localhost:8000/ws/invoices/` (or `VITE_WS_BASE_URL`) with `?token=JWT` (Channels group events)

## 🏗️ Project Structure (key parts)

```
src/
├── components/
│   ├── OcrUpload.tsx
│   ├── NotificationsPanel.tsx
│   ├── SettingsPanel.tsx
│   └── ...
├── controllers/
│   ├── api.ts           # axios client + interceptors
│   ├── useAuth.ts       # auth controller (SimpleJWT)
│   ├── invoices.ts      # invoices API
│   ├── notifications.ts # notifications API
│   ├── ingest.ts        # OCR ingest API
│   └── socket.ts        # WebSocket client
├── i18n/
│   ├── index.tsx        # i18n provider + hook
│   └── locales/{en,fr}.json
├── pages/
│   ├── Dashboard.tsx
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
└── App.jsx, main.jsx
```

## 🔐 Authentication Flow

### Current Implementation (Mock)
1. User enters credentials
2. Frontend validates against mock data
3. User data stored in localStorage
4. Session persists until logout

### Real Backend (current contract)
1. Login → POST `/api/auth/jwt/create/` → `{access, refresh}` stored
2. Me → GET `/api/auth/me/` returns user profile
3. Axios adds `Authorization: Bearer <access>` automatically
4. On 401, interceptor refreshes via `/api/auth/jwt/refresh/`

## 🗄️ Database Schema (Planned)

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,           -- UUID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash
    service VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'employee', 'viewer') NOT NULL,
    avatar_url TEXT,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_service (service)
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50)
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

## 🐍 Python Backend Roadmap (suggested)

### Phase 1: Basic Setup
- [ ] FastAPI/Flask project structure
- [ ] Database connection (MySQL)
- [ ] Basic user model (SQLAlchemy)
- [ ] Authentication endpoints

### Phase 2: Core Authentication
- [ ] JWT token generation
- [ ] Password hashing (bcrypt)
- [ ] Login/logout endpoints
- [ ] User registration

### Phase 3: Advanced Features
- [ ] Permission system
- [ ] Role management
- [ ] User management API
- [ ] Audit logging

### Phase 4: Security & Performance
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Background jobs
- [ ] Monitoring & logging

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment

Create a `.env` (or `.env.local`) at project root for Vite:

```
VITE_API_BASE_URL=/api
# Optional: override proxy target for dev if different from default
# VITE_PROXY_TARGET=http://localhost:8000
# Optional: WebSocket base for realtime (Channels)
VITE_WS_BASE_URL=ws://localhost:8000/ws/invoices/
```

During development, requests to `/api` are proxied to the Django backend (`http://localhost:8000` by default). In production, set `VITE_API_BASE_URL` to your deployed API URL.

### Realtime
- Frontend opens a WebSocket to `VITE_WS_BASE_URL` and passes `?token=<JWT>`.
- Backend should emit invoice/notification events to subscribed user groups.

### Development Workflow
1. **Frontend Development**: Work on React components and UI
2. **Backend Planning**: Design API endpoints and database schema
3. **Integration**: Replace mock data with real API calls
4. **Testing**: Implement comprehensive testing suite
5. **Deployment**: Deploy to production environment

## 🚨 Known Issues & Difficulties

### Authentication Setup Issues
- **Django Template Path**: Django may default to looking for templates in the wrong directory when integrating with React frontend
- **CORS Configuration**: Requires proper `django-cors-headers` setup to allow React dev server requests
- **JWT Field Names**: Django authentication may expect `username` instead of `email` field depending on configuration
- **API Base URL**: Frontend defaults to `http://localhost:9999/api` but Django typically runs on port 8000 - update `.env` accordingly
- **Connection vs Authentication Errors**: "Failed to fetch" indicates connection issues, "401 Unauthorized" means connection works but credentials/format is wrong

### Troubleshooting Steps
1. **Connection Issues**: Check if Django backend is running and CORS is configured
2. **Authentication Issues**: Use the debug button in LoginForm to see exact Django error responses
3. **Field Format**: Try both `email` and `username` fields in login requests
4. **Port Configuration**: Verify `VITE_API_BASE_URL` matches your Django server port

## 🧪 Testing

### Demo Accounts
Use these accounts for testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | marie.dubois@company.com | admin123 | Full access |
| Manager | pierre.martin@company.com | manager123 | Invoice management |
| Employee | jean.durand@company.com | employee123 | Basic operations |
| Viewer | alice.bernard@company.com | viewer123 | Read-only access |

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend (Future)
```bash
# Python backend deployment
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

### Short Term (1-2 months)
- [ ] MySQL database setup
- [ ] Basic Python backend
- [ ] JWT authentication
- [ ] User management API

### Medium Term (3-6 months)
- [ ] Advanced security features
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation

### Long Term (6+ months)
- [ ] Microservices architecture
- [ ] Advanced analytics
- [ ] Mobile app support
- [ ] Enterprise features

---

**Note**: This is a frontend-only implementation. The authentication system currently uses mock data and localStorage. For production use, implement the planned MySQL and Python backend integration.
