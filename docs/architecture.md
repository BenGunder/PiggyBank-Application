# Finance Tracker - Architecture Documentation

## Three-Layer Architecture Overview

The Finance Tracker application follows a clean three-layer architecture pattern:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │◄────────┤    Backend      │◄────────┤    Database     │
│   (UI Layer)    │  HTTP   │   (API Layer)   │  SQL    │   (Data Layer)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Layer Responsibilities

#### 1. Frontend Layer (UI)
- **Technology**: React.js (recommended)
- **Responsibilities**:
  - User interface and interaction
  - Data visualization (charts, graphs)
  - Form validation and user input handling
  - State management
  - API client communication

#### 2. Backend Layer (API)
- **Technology**: FastAPI (Python)
- **Responsibilities**:
  - RESTful API endpoints
  - Business logic implementation
  - Authentication and authorization
  - Request validation
  - Database operations orchestration

#### 3. Database Layer (Data)
- **Technology**: SQLite (with SQLAlchemy ORM)
- **Responsibilities**:
  - Data persistence
  - Data integrity and relationships
  - Query optimization
  - Transaction management

## Communication Flow

### Frontend → Backend Communication

**Protocol**: HTTP/HTTPS
**Data Format**: JSON
**Authentication**: Bearer Token (JWT)

#### Request Flow:
1. Frontend makes HTTP request to backend API endpoint
2. Request includes:
   - Authorization header (JWT token for protected routes)
   - Request body (JSON data for POST/PUT requests)
   - Query parameters (for filtering/pagination)
3. Backend validates request, processes business logic
4. Backend returns response with appropriate status code and JSON data

#### Example Request Structure:
```http
POST /api/expenses/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 50.00,
  "category": "Food",
  "description": "Grocery shopping",
  "budget_id": 1
}
```

#### Example Response Structure:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "user_id": 1,
  "amount": 50.00,
  "category": "Food",
  "description": "Grocery shopping",
  "budget_id": 1,
  "date": "2026-06-23T14:50:00Z",
  "created_at": "2026-06-23T14:50:00Z"
}
```

### Backend → Database Communication

**Protocol**: SQLAlchemy ORM
**Connection**: Database session management
**Transactions**: Automatic commit/rollback

#### Database Operations Flow:
1. Backend receives API request
2. Dependency injection provides database session
3. ORM executes SQL operations through models
4. Session commits changes or rolls back on error
5. Session is closed automatically

#### Example Database Operation:
```python
# Backend creates expense
db_expense = Expense(**expense_data, user_id=current_user.id)
db.add(db_expense)
db.commit()
db.refresh(db_expense)
```

## API Endpoint Contracts

### Authentication Endpoints

#### POST /api/auth/register
- **Purpose**: Register new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Response**: User object (201 Created)
- **Authentication**: Not required

#### POST /api/auth/login
- **Purpose**: Authenticate user and get token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: JWT token (200 OK)
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
- **Authentication**: Not required

#### GET /api/auth/me
- **Purpose**: Get current user info
- **Response**: User object (200 OK)
- **Authentication**: Required (Bearer token)

### Budget Endpoints

#### POST /api/budgets/
- **Purpose**: Create new budget
- **Request Body**:
  ```json
  {
    "name": "Monthly Groceries",
    "amount": 500.00,
    "period": "monthly",
    "category": "Food"
  }
  ```
- **Response**: Budget object (201 Created)
- **Authentication**: Required

#### GET /api/budgets/
- **Purpose**: Get all user budgets
- **Response**: Array of budget objects (200 OK)
- **Authentication**: Required

#### GET /api/budgets/{budget_id}
- **Purpose**: Get specific budget
- **Response**: Budget object (200 OK)
- **Authentication**: Required

#### PUT /api/budgets/{budget_id}
- **Purpose**: Update budget
- **Request Body**: Partial budget object
- **Response**: Updated budget object (200 OK)
- **Authentication**: Required

#### DELETE /api/budgets/{budget_id}
- **Purpose**: Delete budget
- **Response**: 204 No Content
- **Authentication**: Required

### Expense Endpoints

#### POST /api/expenses/
- **Purpose**: Create new expense
- **Request Body**:
  ```json
  {
    "amount": 25.50,
    "category": "Food",
    "description": "Lunch",
    "budget_id": 1,
    "date": "2026-06-23T12:00:00Z"
  }
  ```
- **Response**: Expense object (201 Created)
- **Authentication**: Required

#### GET /api/expenses/
- **Purpose**: Get user expenses with filtering
- **Query Parameters**:
  - `category`: Filter by category (optional)
  - `budget_id`: Filter by budget (optional)
  - `skip`: Pagination offset (default: 0)
  - `limit`: Pagination limit (default: 100)
- **Response**: Array of expense objects (200 OK)
- **Authentication**: Required

#### GET /api/expenses/{expense_id}
- **Purpose**: Get specific expense
- **Response**: Expense object (200 OK)
- **Authentication**: Required

#### PUT /api/expenses/{expense_id}
- **Purpose**: Update expense
- **Request Body**: Partial expense object
- **Response**: Updated expense object (200 OK)
- **Authentication**: Required

#### DELETE /api/expenses/{expense_id}
- **Purpose**: Delete expense
- **Response**: 204 No Content
- **Authentication**: Required

#### GET /api/expenses/analytics/summary
- **Purpose**: Get expense analytics summary
- **Response**:
  ```json
  {
    "total_expenses": 1250.50,
    "expense_count": 45,
    "by_category": {
      "Food": 450.00,
      "Transport": 200.00,
      "Entertainment": 300.50,
      "Utilities": 300.00
    }
  }
  ```
- **Authentication**: Required

## Error Handling

### Standard Error Response Format:
```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes:
- **200 OK**: Successful GET/PUT/PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Password Security**: Bcrypt hashing
3. **CORS**: Configured for frontend origin
4. **Input Validation**: Pydantic schemas for all inputs
5. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
6. **User Isolation**: All queries scoped to authenticated user

## Data Flow Example

### Creating an Expense:
1. **Frontend**: User submits expense form
2. **Frontend**: Validates form data locally
3. **Frontend**: Sends POST request to `/api/expenses/` with JWT token
4. **Backend**: Validates JWT token, extracts user identity
5. **Backend**: Validates request data using Pydantic schema
6. **Backend**: Creates Expense model instance
7. **Backend**: Saves to database via SQLAlchemy
8. **Backend**: Returns created expense with ID
9. **Frontend**: Updates UI with new expense data
10. **Frontend**: Refreshes analytics/charts

## Frontend Integration Guide

### API Client Setup (Example):
```javascript
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Expense methods
  async getExpenses(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/expenses/?${params}`);
  },

  async createExpense(expenseData) {
    return this.request('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }
};
```

## Deployment Considerations

### Backend:
- Use environment variables for sensitive configuration
- Configure production database (PostgreSQL recommended)
- Enable HTTPS
- Set up proper CORS origins
- Implement rate limiting
- Add logging and monitoring

### Database:
- Regular backups
- Migration management with Alembic
- Connection pooling for production
- Index optimization for frequent queries

### Frontend:
- Build optimization
- Environment-specific API URLs
- Secure token storage (httpOnly cookies recommended)
- Error boundary implementation
- Loading states and optimistic updates
