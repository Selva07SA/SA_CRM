# SA CRM Backend System

A comprehensive backend-only CRM (Customer Relationship Management) system built with Node.js, Express.js, and PostgreSQL. This system provides complete CRUD operations for managing clients, leads, employees, and subscriptions.

## 🚀 Features

### Core Features
- **Client & Lead Management**: Full CRUD operations with status tracking
- **Employee Management**: Role-based access control (Admin, Sales, Support)
- **Subscription Management**: Track client subscriptions with payment status
- **Authentication & Authorization**: JWT-based secure authentication
- **RESTful API**: Clean, well-structured API endpoints
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Centralized error handling middleware
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit and integration tests with Jest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SA_CRM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sa_crm
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   API_PREFIX=/api/v1
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb sa_crm
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```
   
   This creates an admin user:
   - Email: `admin@example.com`
   - Password: `admin123`

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

Once the server is running, access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login employee
- `GET /api/v1/auth/profile` - Get current user profile

### Employees
- `GET /api/v1/employees` - Get all employees (with pagination)
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create employee (Admin only)
- `PUT /api/v1/employees/:id` - Update employee (Admin only)
- `DELETE /api/v1/employees/:id` - Delete employee (Admin only)

### Clients
- `GET /api/v1/clients` - Get all clients (with pagination, filters)
- `GET /api/v1/clients/:id` - Get client by ID
- `POST /api/v1/clients` - Create client
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Leads
- `GET /api/v1/leads` - Get all leads (with pagination, filters)
- `GET /api/v1/leads/:id` - Get lead by ID
- `POST /api/v1/leads` - Create lead
- `PUT /api/v1/leads/:id` - Update lead
- `POST /api/v1/leads/:id/convert` - Convert lead to client
- `DELETE /api/v1/leads/:id` - Delete lead

### Subscription Plans
- `GET /api/v1/subscription-plans` - Get all plans
- `GET /api/v1/subscription-plans/:id` - Get plan by ID
- `POST /api/v1/subscription-plans` - Create plan (Admin only)
- `PUT /api/v1/subscription-plans/:id` - Update plan (Admin only)
- `DELETE /api/v1/subscription-plans/:id` - Delete plan (Admin only)

### Subscriptions
- `GET /api/v1/subscriptions` - Get all subscriptions
- `GET /api/v1/subscriptions/:id` - Get subscription by ID
- `POST /api/v1/subscriptions` - Create subscription
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `POST /api/v1/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/v1/subscriptions/:id/renew` - Renew subscription
- `DELETE /api/v1/subscriptions/:id` - Delete subscription

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Login Request
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## 📊 Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────┐
│  Employees  │
│─────────────│
│ id (PK)     │
│ firstName   │
│ lastName    │
│ email       │
│ password    │
│ role        │
│ isActive    │
└──────┬──────┘
       │
       │ (1:N)
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Clients   │   │    Leads    │
│─────────────│   │─────────────│
│ id (PK)     │   │ id (PK)     │
│ firstName   │   │ firstName   │
│ lastName    │   │ lastName    │
│ email       │   │ email       │
│ company     │   │ company     │
│ assignedTo  │───│ assignedTo  │
│ status      │   │ status      │
└──────┬──────┘   │ clientId    │──┐
       │          │ convertedAt │  │
       │          └─────────────┘  │
       │ (1:N)                     │
       │                            │
       ▼                            │
┌─────────────┐                    │
│Subscriptions│                    │
│─────────────│                    │
│ id (PK)     │                    │
│ clientId    │────────────────────┘
│ planId      │──┐
│ status      │  │
│ paymentStatus│ │
│ startDate   │  │
│ endDate     │  │
│ renewalDate │  │
└─────────────┘  │
                 │
                 │ (N:1)
                 │
                 ▼
        ┌─────────────────┐
        │SubscriptionPlans│
        │─────────────────│
        │ id (PK)         │
        │ name            │
        │ price           │
        │ billingCycle    │
        │ features        │
        │ isActive        │
        └─────────────────┘
```

### Key Relationships
- **Employees → Clients**: One employee can be assigned to many clients
- **Employees → Leads**: One employee can be assigned to many leads
- **Clients → Leads**: One client can have many leads (after conversion)
- **Clients → Subscriptions**: One client can have many subscriptions
- **SubscriptionPlans → Subscriptions**: One plan can have many subscriptions

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Test Structure
- **Unit Tests**: `src/tests/unit/` - Test individual services and functions
- **Integration Tests**: `src/tests/integration/` - Test API endpoints

### Example Test Output
```
PASS  src/tests/integration/auth.test.js
  Auth API
    POST /api/v1/auth/login
      ✓ should login with valid credentials
      ✓ should fail with invalid credentials
    GET /api/v1/auth/profile
      ✓ should get profile with valid token

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## 📁 Project Structure

```
SA_CRM/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # App configuration
│   │   └── database.js   # Database configuration
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── employeeController.js
│   │   ├── leadController.js
│   │   ├── subscriptionController.js
│   │   └── subscriptionPlanController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication & authorization
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validation.js # Input validation
│   ├── migrations/       # Database migrations
│   ├── models/           # Sequelize models
│   │   ├── Client.js
│   │   ├── Employee.js
│   │   ├── Lead.js
│   │   ├── Subscription.js
│   │   ├── SubscriptionPlan.js
│   │   └── index.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── subscriptionPlanRoutes.js
│   │   └── index.js
│   ├── seeders/          # Database seeders
│   ├── services/         # Business logic layer
│   │   ├── authService.js
│   │   ├── clientService.js
│   │   ├── employeeService.js
│   │   ├── leadService.js
│   │   ├── subscriptionService.js
│   │   └── subscriptionPlanService.js
│   ├── tests/            # Test files
│   │   ├── integration/
│   │   └── unit/
│   └── server.js         # Application entry point
├── .env.example          # Environment variables template
├── .gitignore
├── .sequelizerc          # Sequelize CLI configuration
├── package.json
└── README.md
```

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Rollback last migration
- `npm run seed` - Run database seeders
- `npm run seed:undo` - Undo seeders

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes)
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Sequelize ORM with parameterized queries

## 📝 API Usage Examples

### Create a Client
```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "company": "Acme Corp"
  }'
```

### Create a Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "status": "new",
    "source": "website"
  }'
```

### Convert Lead to Client
```bash
curl -X POST http://localhost:3000/api/v1/leads/1/convert \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "planId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "paymentStatus": "paid"
  }'
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -l`

### Migration Issues
- Run migrations in order: `npm run migrate`
- Check migration status in database
- Rollback if needed: `npm run migrate:undo`

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration
- Ensure employee account is active

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express.js, and PostgreSQL**
