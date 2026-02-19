# Entity Relationship Diagram (ERD)

## Database Schema Overview

This document provides a detailed view of the database schema for the SA CRM system.

## Entities and Attributes

### 1. Employees Table
**Purpose**: Store employee/user information for authentication and assignment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| firstName | STRING(100) | NOT NULL | Employee first name |
| lastName | STRING(100) | NOT NULL | Employee last name |
| email | STRING | NOT NULL, UNIQUE | Employee email (login) |
| password | STRING | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'sales' | Role: admin, sales, support |
| phone | STRING(20) | NULL | Contact phone |
| isActive | BOOLEAN | DEFAULT true | Account status |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: email (unique)

---

### 2. Clients Table
**Purpose**: Store client/customer information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| firstName | STRING(100) | NOT NULL | Client first name |
| lastName | STRING(100) | NOT NULL | Client last name |
| email | STRING | NOT NULL | Client email |
| phone | STRING(20) | NULL | Contact phone |
| company | STRING(200) | NULL | Company name |
| address | TEXT | NULL | Physical address |
| notes | TEXT | NULL | Additional notes |
| assignedTo | INTEGER | FOREIGN KEY → employees.id | Assigned employee |
| status | ENUM | DEFAULT 'active' | Status: active, inactive, archived |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: email, assignedTo

**Relationships**:
- Belongs to Employee (assignedTo)
- Has many Leads (clientId)
- Has many Subscriptions (clientId)

---

### 3. Leads Table
**Purpose**: Store lead/prospect information before conversion

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| firstName | STRING(100) | NOT NULL | Lead first name |
| lastName | STRING(100) | NOT NULL | Lead last name |
| email | STRING | NOT NULL | Lead email |
| phone | STRING(20) | NULL | Contact phone |
| company | STRING(200) | NULL | Company name |
| source | STRING(100) | NULL | Lead source |
| status | ENUM | NOT NULL, DEFAULT 'new' | Status: new, contacted, qualified, converted |
| notes | TEXT | NULL | Additional notes |
| assignedTo | INTEGER | FOREIGN KEY → employees.id | Assigned employee |
| clientId | INTEGER | FOREIGN KEY → clients.id | Associated client (if converted) |
| convertedAt | TIMESTAMP | NULL | Conversion timestamp |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: email, status, assignedTo, clientId

**Relationships**:
- Belongs to Employee (assignedTo)
- Belongs to Client (clientId) - nullable, set when converted

---

### 4. Subscription Plans Table
**Purpose**: Store available subscription plan templates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | STRING(100) | NOT NULL, UNIQUE | Plan name |
| description | TEXT | NULL | Plan description |
| price | DECIMAL(10,2) | NOT NULL | Plan price |
| billingCycle | ENUM | NOT NULL, DEFAULT 'monthly' | Cycle: monthly, quarterly, yearly |
| features | JSONB | DEFAULT [] | Plan features array |
| isActive | BOOLEAN | DEFAULT true | Plan availability |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: name (unique)

**Relationships**:
- Has many Subscriptions (planId)

---

### 5. Subscriptions Table
**Purpose**: Track client subscriptions to plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| clientId | INTEGER | FOREIGN KEY → clients.id | Subscribing client |
| planId | INTEGER | FOREIGN KEY → subscription_plans.id | Subscription plan |
| status | ENUM | NOT NULL, DEFAULT 'active' | Status: active, expired, canceled |
| paymentStatus | ENUM | NOT NULL, DEFAULT 'pending' | Payment: pending, paid, failed, refunded |
| startDate | DATE | NOT NULL | Subscription start date |
| endDate | DATE | NOT NULL | Subscription end date |
| renewalDate | DATE | NULL | Next renewal date |
| canceledAt | TIMESTAMP | NULL | Cancellation timestamp |
| notes | TEXT | NULL | Additional notes |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes**: clientId, planId, status, paymentStatus

**Relationships**:
- Belongs to Client (clientId)
- Belongs to SubscriptionPlan (planId)

---

## Relationships Summary

### One-to-Many Relationships

1. **Employee → Clients**
   - One employee can be assigned to many clients
   - Foreign key: `clients.assignedTo` → `employees.id`
   - On delete: SET NULL

2. **Employee → Leads**
   - One employee can be assigned to many leads
   - Foreign key: `leads.assignedTo` → `employees.id`
   - On delete: SET NULL

3. **Client → Leads**
   - One client can have many leads (after conversion)
   - Foreign key: `leads.clientId` → `clients.id`
   - On delete: SET NULL

4. **Client → Subscriptions**
   - One client can have many subscriptions
   - Foreign key: `subscriptions.clientId` → `clients.id`
   - On delete: CASCADE

5. **SubscriptionPlan → Subscriptions**
   - One plan can have many subscriptions
   - Foreign key: `subscriptions.planId` → `subscription_plans.id`
   - On delete: RESTRICT (prevents deletion if subscriptions exist)

## Visual ERD (Text Format)

```
┌─────────────────────────────────────────────────────────────┐
│                        EMPLOYEES                            │
├─────────────────────────────────────────────────────────────┤
│ PK │ id              │ INTEGER                              │
│    │ firstName       │ STRING(100)                          │
│    │ lastName        │ STRING(100)                          │
│    │ email           │ STRING (UNIQUE)                      │
│    │ password        │ STRING                               │
│    │ role            │ ENUM(admin,sales,support)            │
│    │ phone           │ STRING(20)                           │
│    │ isActive        │ BOOLEAN                              │
│    │ createdAt       │ TIMESTAMP                            │
│    │ updatedAt       │ TIMESTAMP                            │
└────┼────────────────────────────────────────────────────────┘
     │
     │ (1:N)
     │
     ├───────────────────────────────┐
     │                               │
     ▼                               ▼
┌──────────────────────┐    ┌──────────────────────┐
│       CLIENTS        │    │        LEADS         │
├──────────────────────┤    ├──────────────────────┤
│ PK │ id              │    │ PK │ id              │
│    │ firstName       │    │    │ firstName       │
│    │ lastName        │    │    │ lastName        │
│    │ email           │    │    │ email           │
│    │ phone           │    │    │ phone           │
│    │ company         │    │    │ company         │
│    │ address         │    │    │ source          │
│    │ notes           │    │    │ status          │
│ FK │ assignedTo      │──┐ │ FK │ assignedTo      │──┐
│    │ status          │  │ │ FK │ clientId        │──┼──┐
│    │ createdAt       │  │ │    │ convertedAt     │  │  │
│    │ updatedAt       │  │ │    │ createdAt       │  │  │
└────┼──────────────────┘  │ │    │ updatedAt       │  │  │
     │                     │ └────┼──────────────────┘  │  │
     │ (1:N)              │      │                     │  │
     │                     │      │                     │  │
     │                     │      │                     │  │
     ▼                     │      │                     │  │
┌──────────────────────┐   │      │                     │  │
│   SUBSCRIPTIONS      │   │      │                     │  │
├──────────────────────┤   │      │                     │  │
│ PK │ id              │   │      │                     │  │
│ FK │ clientId        │───┘      │                     │  │
│ FK │ planId          │──────────┼─────────────────────┼──┘
│    │ status          │          │                     │
│    │ paymentStatus   │          │                     │
│    │ startDate       │          │                     │
│    │ endDate         │          │                     │
│    │ renewalDate     │          │                     │
│    │ canceledAt      │          │                     │
│    │ notes           │          │                     │
│    │ createdAt       │          │                     │
│    │ updatedAt       │          │                     │
└────┼──────────────────┘          │                     │
     │                             │                     │
     │ (N:1)                       │                     │
     │                             │                     │
     ▼                             │                     │
┌──────────────────────┐           │                     │
│ SUBSCRIPTION PLANS   │           │                     │
├──────────────────────┤           │                     │
│ PK │ id              │           │                     │
│    │ name            │           │                     │
│    │ description     │           │                     │
│    │ price           │           │                     │
│    │ billingCycle    │           │                     │
│    │ features        │           │                     │
│    │ isActive        │           │                     │
│    │ createdAt       │           │                     │
│    │ updatedAt       │           │                     │
└──────────────────────┘           │                     │
                                  │                     │
                                  │                     │
                                  └─────────────────────┘
```

## Business Rules

1. **Lead Conversion**: When a lead is converted, it can be associated with an existing client or a new client is created automatically.

2. **Employee Assignment**: Both clients and leads can be assigned to employees. If an employee is deleted, assignments are set to NULL.

3. **Subscription Management**: 
   - A client can have multiple subscriptions (to different plans or overlapping periods)
   - Subscriptions have start and end dates
   - Renewal dates are calculated based on billing cycle
   - Payment status is tracked separately from subscription status

4. **Plan Deletion**: Subscription plans cannot be deleted if they have active subscriptions (RESTRICT constraint).

5. **Client Deletion**: When a client is deleted, all associated subscriptions are deleted (CASCADE), but leads remain (SET NULL).

## Indexes

### Performance Indexes
- `employees.email` - Unique index for login lookups
- `clients.email` - Index for search functionality
- `clients.assignedTo` - Index for filtering by employee
- `leads.status` - Index for filtering by status
- `leads.assignedTo` - Index for filtering by employee
- `subscriptions.status` - Index for filtering active subscriptions
- `subscriptions.paymentStatus` - Index for payment queries

## Data Types

- **ENUM Types**: Used for status fields to ensure data integrity
- **JSONB**: Used for subscription plan features (PostgreSQL-specific, allows efficient JSON queries)
- **DECIMAL**: Used for prices to ensure precision
- **TIMESTAMP**: Used for all date/time fields

---

**Last Updated**: 2024-01-01
**Database Version**: PostgreSQL 12+
