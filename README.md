# Finance Tracker App

A personal finance and expense tracking application with a three-layer architecture (Frontend, Backend, Database).

## Features

- **User Authentication**: Registration and login with JWT token-based authentication
- **Budget Management**: Create, read, update, and delete budgets with categorization
- **Expense Tracking**: Log and categorize expenses with optional budget association
- **Data Analytics**: Summary views of expenses by category and total spending
- **Secure**: Password hashing with bcrypt, JWT authentication, user data isolation

## Architecture

The application follows a clean three-layer architecture:

```
Frontend (React) ←→ Backend (FastAPI) ←→ Database (SQLite)
```

### Backend Layer
- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **API Documentation**: Auto-generated Swagger UI at `/docs`

### Frontend Layer
- **Framework**: React (to be implemented)
- **Communication**: RESTful API with JSON
- **Features**: UI, data visualization, form handling

### Database Layer
- **Database**: SQLite (easily upgradable to PostgreSQL)
- **ORM**: SQLAlchemy
- **Models**: User, Budget, Expense

## Project Structure

```
finance-tracker/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration and security
│   │   ├── database/       # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── routers/        # API endpoints
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application (to be implemented)
└── docs/
    └── architecture.md     # Detailed architecture documentation
```

## Backend Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the backend directory (optional):
```env
DATABASE_URL=sqlite:///./finance_tracker.db
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Running the Backend

Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative API Docs: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Budgets
- `POST /api/budgets/` - Create budget
- `GET /api/budgets/` - Get all user budgets
- `GET /api/budgets/{id}` - Get specific budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Expenses
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/` - Get expenses (with filtering)
- `GET /api/expenses/{id}` - Get specific expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/analytics/summary` - Get expense analytics

## Database Schema

### Users
- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username
- `hashed_password`: Bcrypt hashed password
- `is_active`: Account status
- `created_at`, `updated_at`: Timestamps

### Budgets
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Budget name
- `amount`: Budget amount
- `period`: Budget period (monthly, weekly, yearly)
- `category`: Optional category
- `created_at`, `updated_at`: Timestamps

### Expenses
- `id`: Primary key
- `user_id`: Foreign key to users
- `budget_id`: Optional foreign key to budgets
- `amount`: Expense amount
- `category`: Expense category
- `description`: Optional description
- `date`: Expense date
- `created_at`, `updated_at`: Timestamps

## Security Features

- Password hashing with bcrypt
- JWT token authentication with expiration
- CORS configuration for frontend integration
- User data isolation (users can only access their own data)
- Input validation with Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM

## Development

### Adding New API Endpoints

1. Create/update model in `app/models/`
2. Create/update schema in `app/schemas/`
3. Create/update router in `app/routers/`
4. Register router in `main.py`

### Database Migrations

For production use, consider setting up Alembic for database migrations:
```bash
alembic init migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Testing

The backend includes auto-generated API documentation at `/docs` which can be used for testing endpoints interactively.

## Frontend Development

The frontend directory is prepared for React development. To set up the frontend:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Initialize a React project (using Create React App or Vite):
```bash
npm create vite@latest . -- --template react
```

3. Install necessary dependencies for API communication and data visualization:
```bash
npm install axios recharts
```

4. Configure the API client to communicate with the backend at `http://localhost:8000/api`

## Documentation

Detailed architecture documentation and API contracts are available in `docs/architecture.md`.

## License

This project is provided as-is for educational and personal use.
