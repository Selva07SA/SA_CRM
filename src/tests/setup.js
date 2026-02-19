const { sequelize } = require('../models');

// Setup before all tests
beforeAll(async () => {
  // Use test database
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Unable to connect to test database:', error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Clear database between tests
beforeEach(async () => {
  try {
    // Truncate all tables in correct order (respecting foreign keys)
    await sequelize.query('TRUNCATE TABLE subscriptions, subscription_plans, leads, clients, employees CASCADE');
  } catch (error) {
    // Ignore errors if tables don't exist yet
    if (!error.message.includes('does not exist')) {
      console.error('Error truncating tables:', error);
    }
  }
});
