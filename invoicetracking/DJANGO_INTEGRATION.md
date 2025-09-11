# Django Backend Integration Guide

This document provides instructions for integrating your React frontend with a Django backend.

## Overview

The React application has been optimized with:
- **Separate route management** with lazy loading and code splitting
- **API service layer** with centralized Django communication
- **Performance optimizations** including bundle splitting and caching
- **Error boundaries** and monitoring utilities

## Django Endpoint Configuration

### 1. Update API Endpoints

Replace the placeholder URLs in `src/services/apiEndpoints.ts` with your actual Django endpoints:

```typescript
// Example: Replace placeholder with actual Django URL
AUTH: {
  LOGIN: '/auth/token/',           // Replace with: '/api/v1/auth/login/'
  REFRESH: '/auth/token/refresh/', // Replace with: '/api/v1/auth/refresh/'
  // ... other endpoints
}
```

### 2. Environment Configuration

Update your `.env` file with the correct Django backend URL:

```env
# Current setting
VITE_API_BASE_URL=http://localhost:9999/api

# Update to match your Django server
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Django CORS Configuration

Ensure your Django backend has CORS configured for the React frontend:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:60298",  # React dev server
    "http://127.0.0.1:60298",
]

CORS_ALLOW_CREDENTIALS = True
```

### 4. Django URL Patterns

Your Django `urls.py` should include patterns matching the API endpoints:

```python
# urls.py
urlpatterns = [
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/invoices/', include('invoices.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/files/', include('files.urls')),
    path('api/v1/settings/', include('settings.urls')),
    path('api/v1/reports/', include('reports.urls')),
]
```

## API Service Usage

### Authentication Service

```typescript
import { AuthService } from '../services/apiService';

// Login
const result = await AuthService.login(email, password);

// Get current user
const user = await AuthService.getCurrentUser();

// Register
await AuthService.register(userData);
```

### Invoice Service

```typescript
import { InvoiceService } from '../services/apiService';

// Get invoices with pagination
const invoices = await InvoiceService.getInvoices({ page: 1, pageSize: 10 });

// Create invoice
const newInvoice = await InvoiceService.createInvoice(invoiceData);

// Export invoices
const exportData = await InvoiceService.exportInvoices('pdf');
```

## Performance Features Implemented

### 1. Code Splitting
- Routes are lazy-loaded using `React.lazy()`
- Components load only when needed
- Reduces initial bundle size

### 2. Bundle Optimization
- Vendor libraries separated into chunks
- Manual chunk splitting for better caching
- Console logs removed in production

### 3. API Optimization
- Centralized error handling
- Request/response interceptors
- Automatic token refresh

### 4. Performance Monitoring
- Render performance tracking
- Bundle size analysis
- Virtual scrolling for large lists

## WebSocket Integration

For real-time features, update the WebSocket endpoints in `src/services/apiEndpoints.ts`:

```typescript
export const WS_ENDPOINTS = {
  INVOICES: '/ws/invoices/',        // Replace with your Django WebSocket URL
  NOTIFICATIONS: '/ws/notifications/', // Replace with your Django WebSocket URL
  ANALYTICS: '/ws/analytics/',      // Replace with your Django WebSocket URL
} as const;
```

## Error Handling

The API service layer includes comprehensive error handling:

```typescript
try {
  const data = await InvoiceService.getInvoices();
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

## Development vs Production

### Development
- Source maps enabled for debugging
- Console logs preserved
- Hot module replacement active

### Production
- Console logs removed
- Bundle minified and optimized
- Source maps available for debugging

## Next Steps

1. **Update endpoint URLs** in `src/services/apiEndpoints.ts`
2. **Configure Django CORS** settings
3. **Test API integration** with your Django backend
4. **Implement missing endpoints** (approval workflow, archive functionality)
5. **Set up WebSocket connections** for real-time features

## Performance Monitoring

Use the built-in performance utilities:

```typescript
import { usePerformanceMonitor, debounce, throttle } from '../utils/performance';

// Monitor component render performance
const { measureRender } = usePerformanceMonitor();

// Debounce search inputs
const debouncedSearch = debounce(searchFunction, 300);

// Throttle scroll events
const throttledScroll = throttle(scrollHandler, 100);
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Django CORS settings allow your frontend domain
2. **Authentication Failures**: Verify token format matches Django expectations
3. **API Endpoint 404s**: Check Django URL patterns match frontend endpoints
4. **Performance Issues**: Use browser dev tools to analyze bundle size and network requests

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

This will preserve console logs and enable additional debugging features.
