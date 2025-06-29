const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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

// Test the connection
pool.connect()
  .then(() => console.log('Database connection test successful'))
  .catch(err => console.error('Database connection test failed:', err));

// Middleware to verify JWT
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expired' });
//     }
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };

// // Auth Routes
// // User registration
// app.post('/api/auth/register', async (req, res) => {
//   const { username, email, password } = req.body;
  
//   if (!username || !email || !password) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   try {
//     // Check if user already exists
//     const existingUser = await pool.query(
//       'SELECT id FROM users WHERE email = $1 OR username = $2',
//       [email, username]
//     );

//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Insert new user (you should hash the password in production)
//     const result = await pool.query(
//       'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
//       [username, email, password] // Remember to hash password in production
//     );

//     const user = result.rows[0];
//     const token = jwt.sign(
//       { id: user.id, username: user.username }, 
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       message: 'User created successfully',
//       token,
//       user: { id: user.id, username: user.username, email: user.email }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // User login
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
  
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password are required' });
//   }

//   try {
//     const result = await pool.query(
//       'SELECT id, username, email, password FROM users WHERE email = $1',
//       [email]
//     );

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = result.rows[0];
    
//     // In production, compare hashed passwords
//     if (user.password !== password) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user.id, username: user.username }, 
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({
//       message: 'Login successful',
//       token,
//       user: { id: user.id, username: user.username, email: user.email }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

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
    res.status(500).json({ error: 'Failed to fetch plans' });
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
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// Create a new plan with steps
app.post('/api/plans', async (req, res) => {
  const { title, description, steps, category, is_ai_generated = false } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Plan title is required' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert the plan
    const planResult = await client.query(
      `INSERT INTO plans (id, title, description, category, is_ai_generated, user_id, created_at, updated_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [title, description, category, is_ai_generated, 'default-user-id']
    );
    
    const plan = planResult.rows[0];
    
    // Insert plan steps if provided
    if (steps && steps.length > 0) {
      const stepInserts = steps.map((step, index) => 
        client.query(
          `INSERT INTO plan_steps (plan_id, title, description, order_number) 
           VALUES ($1, $2, $3, $4)`,
          [plan.id, step.title, step.description, step.order || index + 1]
        )
      );
      
      await Promise.all(stepInserts);
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
    
    res.status(201).json(completeResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Failed to create plan' });
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
    res.status(500).json({ error: 'Failed to update plan' });
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
    res.status(500).json({ error: 'Failed to delete plan' });
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
    res.status(500).json({ error: 'Failed to update plan step' });
  }
});

// ===== END PLANS API ROUTES =====

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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
});