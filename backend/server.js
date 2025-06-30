const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware - FIXED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize PostgreSQL client with error handling
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 10, // maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

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

initializeDatabase();

// ===== PLANS API ROUTES =====

// Get all plans
app.get('/api/plans', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ps.id,
                   'title', ps.title,
                   'description', ps.description,
                   'order_number', ps.order_number,
                   'completed', ps.is_completed,
                   'created_at', ps.created_at,
                   'updated_at', ps.updated_at
                 ) ORDER BY ps.order_number
               ) FILTER (WHERE ps.id IS NOT NULL), 
               '[]'
             ) as plan_steps
      FROM plans p
      LEFT JOIN plan_steps ps ON p.id = ps.plan_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans', details: error.message });
  }
});

// Get a single plan by ID
app.get('/api/plans/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ps.id,
                   'title', ps.title,
                   'description', ps.description,
                   'order_number', ps.order_number,
                   'completed', ps.is_completed,
                   'created_at', ps.created_at,
                   'updated_at', ps.updated_at
                 ) ORDER BY ps.order_number
               ) FILTER (WHERE ps.id IS NOT NULL), 
               '[]'
             ) as plan_steps
      FROM plans p
      LEFT JOIN plan_steps ps ON p.id = ps.plan_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan', details: error.message });
  }
});

// Create a new plan with steps - ENHANCED ERROR HANDLING
app.post('/api/plans', async (req, res) => {
  const { title, description, steps, category, is_ai_generated = false } = req.body;
  
  console.log('Received plan creation request:', { title, description, steps, category, is_ai_generated });
  
  if (!title) {
    return res.status(400).json({ error: 'Plan title is required' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert the plan
    const planResult = await client.query(
      `INSERT INTO plans (title, description, category, is_ai_generated, user_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [title, description, category, is_ai_generated, 'default-user-id']
    );
    
    const plan = planResult.rows[0];
    console.log('Plan created:', plan);
    
    // Insert plan steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      console.log('Inserting steps:', steps);
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await client.query(
          `INSERT INTO plan_steps (plan_id, title, description, order_number) 
           VALUES ($1, $2, $3, $4)`,
          [plan.id, step.title, step.description, step.order || i + 1]
        );
      }
      
      console.log(`Inserted ${steps.length} steps`);
    }
    
    await client.query('COMMIT');
    
    // Fetch the complete plan with steps
    const completeResult = await pool.query(`
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ps.id,
                   'title', ps.title,
                   'description', ps.description,
                   'order_number', ps.order_number,
                   'completed', ps.is_completed,
                   'created_at', ps.created_at,
                   'updated_at', ps.updated_at
                 ) ORDER BY ps.order_number
               ) FILTER (WHERE ps.id IS NOT NULL), 
               '[]'
             ) as plan_steps
      FROM plans p
      LEFT JOIN plan_steps ps ON p.id = ps.plan_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [plan.id]);
    
    console.log('Plan created successfully:', completeResult.rows[0]);
    res.status(201).json(completeResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating plan:', error);
    res.status(500).json({ 
      error: 'Failed to create plan', 
      details: error.message,
      code: error.code 
    });
  } finally {
    client.release();
  }
});

// Update a plan
app.put('/api/plans/:id', async (req, res) => {
  const { title, description, category } = req.body;
  const planId = req.params.id;
  
  try {
    const result = await pool.query(
      `UPDATE plans 
       SET title = $1, description = $2, category = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [title, description, category, planId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan', details: error.message });
  }
});

// Delete a plan
app.delete('/api/plans/:id', async (req, res) => {
  const planId = req.params.id;
  
  try {
    const result = await pool.query(
      'DELETE FROM plans WHERE id = $1 RETURNING *',
      [planId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan', details: error.message });
  }
});

// Update plan step completion status
app.patch('/api/plans/:planId/steps/:stepId', async (req, res) => {
  const { planId, stepId } = req.params;
  const { is_completed } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE plan_steps 
       SET is_completed = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND plan_id = $3 RETURNING *`,
      [is_completed, stepId, planId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan step not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan step:', error);
    res.status(500).json({ error: 'Failed to update plan step', details: error.message });
  }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== END PLANS API ROUTES =====

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: http://localhost:3000, http://localhost:3001, http://localhost:5173, http://localhost:5174`);
});