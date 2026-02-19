# API Usage Examples

This document provides practical examples of using the SA CRM API.

## Table of Contents
- [Authentication](#authentication)
- [Employee Management](#employee-management)
- [Client Management](#client-management)
- [Lead Management](#lead-management)
- [Subscription Management](#subscription-management)

## Authentication

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Employee Management

### Create Employee (Admin Only)
```bash
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Sales",
    "email": "john.sales@example.com",
    "password": "password123",
    "role": "sales",
    "phone": "555-0100"
  }'
```

### Get All Employees (with pagination)
```bash
curl -X GET "http://localhost:3000/api/v1/employees?page=1&limit=10&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Employee by ID
```bash
curl -X GET http://localhost:3000/api/v1/employees/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Employee (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/v1/employees/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "support",
    "isActive": true
  }'
```

## Client Management

### Create Client
```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "555-0200",
    "company": "Acme Corporation",
    "address": "123 Main St, City, State 12345",
    "assignedTo": 1,
    "status": "active"
  }'
```

### Get All Clients (with filters)
```bash
# Search by name/email/company
curl -X GET "http://localhost:3000/api/v1/clients?search=acme&status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by assigned employee
curl -X GET "http://localhost:3000/api/v1/clients?assignedTo=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Client
```bash
curl -X PUT http://localhost:3000/api/v1/clients/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme Corp Updated",
    "notes": "Important client - follow up needed"
  }'
```

## Lead Management

### Create Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob.smith@example.com",
    "phone": "555-0300",
    "company": "Tech Startup Inc",
    "source": "website",
    "status": "new",
    "assignedTo": 1,
    "notes": "Interested in enterprise plan"
  }'
```

### Update Lead Status
```bash
curl -X PUT http://localhost:3000/api/v1/leads/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified"
  }'
```

### Convert Lead to Client
```bash
# Convert and create new client automatically
curl -X POST http://localhost:3000/api/v1/leads/1/convert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Convert and associate with existing client
curl -X POST http://localhost:3000/api/v1/leads/1/convert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "lead": {
      "id": 1,
      "status": "converted",
      "clientId": 5,
      "convertedAt": "2024-01-15T10:30:00.000Z"
    },
    "client": {
      "id": 5,
      "firstName": "Bob",
      "lastName": "Smith"
    }
  }
}
```

## Subscription Management

### Create Subscription Plan (Admin Only)
```bash
curl -X POST http://localhost:3000/api/v1/subscription-plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Plan",
    "description": "Full-featured plan for large organizations",
    "price": 299.99,
    "billingCycle": "monthly",
    "features": [
      "Unlimited users",
      "Priority support",
      "Advanced analytics",
      "API access"
    ],
    "isActive": true
  }'
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "planId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "paymentStatus": "paid",
    "notes": "Annual contract"
  }'
```

### Get Active Subscriptions
```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions?status=active&paymentStatus=paid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Renew Subscription
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions/1/renew \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "id": 1,
    "endDate": "2024-03-01",
    "renewalDate": "2024-04-01",
    "status": "active",
    "paymentStatus": "pending"
  }
}
```

### Cancel Subscription
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions/1/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Route /api/v1/invalid not found"
}
```

## Using JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Login
async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  return response.data.data.token;
}

// Create client
async function createClient(token, clientData) {
  const response = await axios.post(
    `${API_BASE_URL}/clients`,
    clientData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.data;
}

// Example usage
(async () => {
  try {
    const token = await login('admin@example.com', 'admin123');
    const client = await createClient(token, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Acme Corp'
    });
    console.log('Client created:', client);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
```

## Using Python

```python
import requests

API_BASE_URL = 'http://localhost:3000/api/v1'

# Login
def login(email, password):
    response = requests.post(
        f'{API_BASE_URL}/auth/login',
        json={'email': email, 'password': password}
    )
    return response.json()['data']['token']

# Create client
def create_client(token, client_data):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        f'{API_BASE_URL}/clients',
        json=client_data,
        headers=headers
    )
    return response.json()['data']

# Example usage
if __name__ == '__main__':
    token = login('admin@example.com', 'admin123')
    client = create_client(token, {
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john@example.com',
        'company': 'Acme Corp'
    })
    print('Client created:', client)
```

---

For more details, visit the Swagger documentation at `http://localhost:3000/api-docs`
