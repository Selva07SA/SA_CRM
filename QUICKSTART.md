# Quick Start Guide

Get the SA CRM backend up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js installed (v14+)
- [ ] PostgreSQL installed and running
- [ ] npm or yarn installed

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sa_crm
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Create Database
```bash
# Using psql
createdb sa_crm

# Or using PostgreSQL command line
psql -U postgres -c "CREATE DATABASE sa_crm;"
```

### 4. Run Migrations
```bash
npm run migrate
```

This creates all necessary tables:
- employees
- clients
- leads
- subscription_plans
- subscriptions

### 5. Seed Initial Data (Optional)
```bash
npm run seed
```

This creates an admin user:
- Email: `admin@example.com`
- Password: `admin123`

### 6. Start the Server
```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
📊 Database models loaded.
🚀 Server is running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
```

## First API Call

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the `token` from the response.

### Create Your First Client
```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "company": "Acme Corp"
  }'
```

## Next Steps

1. **Explore API Documentation**: Visit http://localhost:3000/api-docs
2. **Read Full Documentation**: See [README.md](README.md)
3. **Check API Examples**: See [API_EXAMPLES.md](API_EXAMPLES.md)
4. **Review Database Schema**: See [ERD.md](ERD.md)

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Verify database exists: `psql -l | grep sa_crm`

### Migration Errors
- Ensure database is empty or use a fresh database
- Check PostgreSQL version (12+)
- Verify user has CREATE privileges

### Port Already in Use
- Change PORT in `.env`
- Or kill process using port 3000: `lsof -ti:3000 | xargs kill`

## Development Tips

- Use `npm run dev` for auto-reload during development
- Check logs in console for debugging
- Use Swagger UI for interactive API testing
- Run tests: `npm test`

---

**Ready to build!** 🚀
