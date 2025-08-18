# FactureFlow - Authentication Module

A modern React-based authentication system for invoice tracking applications, designed with future MySQL and Python backend integration in mind.

## 🚀 Current Status

**Frontend Authentication Module** - ✅ **COMPLETE**
- User login/registration forms
- Role-based access control (RBAC)
- Mock authentication system
- Responsive UI with Tailwind CSS
- TypeScript support

**Backend Integration** - 🚧 **PLANNED**
- MySQL database integration
- Python backend API (FastAPI/Flask)
- JWT token authentication
- Real user management

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

### Future Backend (Planned)
- **Python 3.11+** - Backend runtime
- **FastAPI/Flask** - Web framework
- **MySQL 8.0+** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

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

### Dependencies Installation
The project will automatically install:
- React and React DOM
- TypeScript types
- Tailwind CSS
- Lucide React icons
- Development tools (ESLint, Vite)

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

### Planned Features
- 🔄 **Backend Integration**
  - MySQL database storage
  - Python API endpoints
  - JWT token authentication
  - Real user validation

- 🔄 **Security Enhancements**
  - Password hashing (bcrypt)
  - Account lockout protection
  - Two-factor authentication
  - Session management

- 🔄 **Advanced Features**
  - Password reset functionality
  - Email verification
  - User activity logging
  - Bulk user operations

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── LoginForm.tsx   # Login form component
│   └── RegisterForm.tsx # Registration form component
├── controllers/         # Business logic hooks
│   └── useAuth.ts      # Authentication controller
├── data/               # Mock data (temporary)
│   └── users.ts        # User data and permissions
├── types/              # TypeScript type definitions
│   └── Auth.ts         # Authentication types
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## 🔐 Authentication Flow

### Current Implementation (Mock)
1. User enters credentials
2. Frontend validates against mock data
3. User data stored in localStorage
4. Session persists until logout

### Future Implementation (Real Backend)
1. User enters credentials
2. Frontend sends request to Python API
3. Backend validates against MySQL database
4. JWT token returned and stored
5. Token used for subsequent requests

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

## 🐍 Python Backend Roadmap

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

### Development Workflow
1. **Frontend Development**: Work on React components and UI
2. **Backend Planning**: Design API endpoints and database schema
3. **Integration**: Replace mock data with real API calls
4. **Testing**: Implement comprehensive testing suite
5. **Deployment**: Deploy to production environment

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
