# Invoice Tracking System - Project Structure

## 📁 Architecture Overview

This project follows a clean, modular architecture with clear separation of concerns:

```
src/
├── components/          # Legacy components (to be refactored)
├── widgets/            # ✅ Reusable UI widgets
├── ui/                 # ✅ Basic UI components
├── pages/              # Page-level components
├── mock-data/          # ✅ Centralized mock data
├── types/              # TypeScript type definitions
├── services/           # API and business logic
├── controllers/        # State management
├── routes/             # Routing configuration
├── utils/              # Utility functions
├── i18n/               # Internationalization
└── assets/             # Static assets
```

## 🎯 Architectural Principles

### 1. **Separation of Concerns**
- **Widgets**: Reusable, pure UI components
- **Pages**: Business logic and data fetching
- **Services**: API calls and data transformation
- **Mock Data**: Development/testing data in separate folder

### 2. **Component Hierarchy**
```
Pages (Business Logic)
  ↓
Widgets (Reusable Components)
  ↓
UI Components (Basic Elements)
```

### 3. **Data Flow**
```
Database → Services → Controllers → Pages → Widgets → UI
```

## 📊 Database Schema

### Core Tables
- `users` - User management with roles and permissions
- `services` - Organizational departments/services
- `vendors` - Vendor information and ratings
- `invoices` - Invoice data with full lifecycle
- `invoice_line_items` - Detailed line items
- `invoice_history` - Audit trail

### AI & Analytics Tables
- `ai_document_processing` - OCR and document extraction
- `ai_fraud_detection` - Fraud risk analysis
- `ai_categorization` - Automatic categorization
- `ai_report_insights` - AI-generated insights
- `ai_assistant_conversations` - Chat history

### Workflow & Notifications
- `workflow_rules` - Automation rules
- `notifications` - User notifications
- `analytics_metrics` - Performance metrics
- `export_history` - Data export tracking

## 🧩 Widget Components

### Available Widgets
- **InvoiceWidget** - Invoice display and actions
- **VendorWidget** - Vendor information cards
- **UserWidget** - User profile displays
- **ServiceWidget** - Service/department cards
- **AnalyticsWidget** - Metrics and charts
- **NotificationWidget** - Notification center
- **AIInsightWidget** - AI-generated insights

### Widget Features
- Compact and full display modes
- Consistent action patterns
- Responsive design
- Accessibility support

## 🎨 UI Components

### Basic Components
- **Button** - Various styles and states
- **Input** - Form inputs with validation
- **Modal** - Dialog overlays
- **Card** - Content containers
- **Badge** - Status indicators
- **Spinner** - Loading states
- **Dropdown** - Selection menus
- **Tabs** - Content organization

## 📦 Mock Data Structure

### Organized by Entity
```
mock-data/
├── invoices.ts         # Invoice and line item data
├── vendors.ts          # Vendor information
├── users.ts            # User profiles and permissions
├── services.ts         # Department/service data
├── analytics.ts        # Metrics and dashboard stats
├── notifications.ts    # Notification examples
├── aiInsights.ts       # AI-generated insights
└── index.ts            # Centralized exports
```

## 🔄 Integration Points

### Frontend ↔ Backend
- RESTful API endpoints
- Real-time WebSocket connections
- File upload handling
- Authentication middleware

### AI Services Integration
- Document processing pipeline
- Fraud detection algorithms
- Categorization engine
- Insight generation

## 🚀 Development Workflow

### 1. **Component Development**
```typescript
// Create reusable widget
src/widgets/NewWidget.tsx

// Use in pages
import { NewWidget } from '../widgets';
```

### 2. **Mock Data Usage**
```typescript
// Development mode
import { mockInvoices } from '../mock-data';

// Production mode
import { fetchInvoices } from '../services/api';
```

### 3. **Type Safety**
```typescript
// Define types
src/types/newEntity.ts

// Use throughout application
import { NewEntity } from '../types/newEntity';
```

## 📈 Performance Considerations

### Code Splitting
- Lazy loading of pages
- Dynamic imports for widgets
- Chunked bundle optimization

### Data Management
- Efficient state management
- Caching strategies
- Pagination for large datasets

### UI Optimization
- Virtual scrolling for lists
- Debounced search inputs
- Optimized re-renders

## 🔒 Security Features

### Authentication & Authorization
- Role-based access control
- Permission-based UI rendering
- Secure API endpoints

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF tokens

## 🧪 Testing Strategy

### Component Testing
- Widget unit tests
- UI component tests
- Integration tests

### Data Testing
- Mock data validation
- API endpoint testing
- Database schema validation

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Widget Adaptability
- Compact mode for mobile
- Full mode for desktop
- Flexible grid layouts

## 🌐 Internationalization

### Supported Languages
- English (default)
- French
- Additional languages configurable

### Implementation
- React i18n integration
- Dynamic language switching
- Localized date/currency formats

---

## 🎯 Next Steps

1. **Refactor Legacy Components** - Move existing components to widget pattern
2. **API Integration** - Connect widgets to real backend services
3. **Testing Implementation** - Add comprehensive test suite
4. **Performance Optimization** - Implement code splitting and caching
5. **Documentation** - Complete component documentation and examples
