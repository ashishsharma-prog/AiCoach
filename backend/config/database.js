const { Pool } = require('pg');
require('dotenv').config();

// if (!process.env.DATABASE_URL) {
//     throw new Error('DATABASE_URL is not defined.');
// }
// Initialize PostgreSQL client with Railway DATABASE_URL if available
const pool = new Pool(
    process.env.DATABASE_PUBLIC_URL && {
        connectionString: process.env.DATABASE_PUBLIC_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        min: 1,
    }
);

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Test the connection and create tables if they don't exist
const initializeDatabase = async () => {
    try {
        await pool.connect();
        console.log('Database connection test successful');

        // Create tables if they don't exist
        await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        is_ai_generated BOOLEAN DEFAULT false,
        user_id VARCHAR(255) DEFAULT 'default-user-id',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_steps (
        id SERIAL PRIMARY KEY,
        plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_number INTEGER DEFAULT 1,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Database tables initialized successfully');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

module.exports = {
    pool,
    initializeDatabase,
};
