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
  console.error('Unexpected error on idle client', err);
});

pool.connect()
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

// // Protected Routes
// // Get all plans for a user
// app.get('/api/plans', authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, 
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', ps.id,
//                    'step_number', ps.step_number,
//                    'description', ps.description,
//                    'completed', ps.completed
//                  ) ORDER BY ps.step_number
//                ) FILTER (WHERE ps.id IS NOT NULL), 
//                '[]'
//              ) as plan_steps
//       FROM plans p
//       LEFT JOIN plan_steps ps ON p.id = ps.plan_id
//       WHERE p.user_id = $1
//       GROUP BY p.id
//       ORDER BY p.created_at DESC
//     `, [req.user.id]);

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching plans:', error);
//     res.status(500).json({ error: 'Failed to fetch plans' });
//   }
// });

// // Get a single plan by ID
// app.get('/api/plans/:id', authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT p.*, 
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', ps.id,
//                    'step_number', ps.step_number,
//                    'description', ps.description,
//                    'completed', ps.completed
//                  ) ORDER BY ps.step_number
//                ) FILTER (WHERE ps.id IS NOT NULL), 
//                '[]'
//              ) as plan_steps
//       FROM plans p
//       LEFT JOIN plan_steps ps ON p.id = ps.plan_id
//       WHERE p.id = $1 AND p.user_id = $2
//       GROUP BY p.id
//     `, [req.params.id, req.user.id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Plan not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching plan:', error);
//     res.status(500).json({ error: 'Failed to fetch plan' });
//   }
// });

// // Create a new plan
// app.post('/api/plans', authenticateToken, async (req, res) => {
//   const { title, description, steps } = req.body;
  
//   if (!title) {
//     return res.status(400).json({ error: 'Plan title is required' });
//   }

//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     // Insert the plan
//     const planResult = await client.query(
//       'INSERT INTO plans (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
//       [title, description, req.user.id]
//     );
    
//     const plan = planResult.rows[0];
    
//     // Insert plan steps if provided
//     if (steps && steps.length > 0) {
//       const stepInserts = steps.map((step, index) => 
//         client.query(
//           'INSERT INTO plan_steps (plan_id, step_number, description) VALUES ($1, $2, $3)',
//           [plan.id, index + 1, step.description]
//         )
//       );
      
//       await Promise.all(stepInserts);
//     }
    
//     await client.query('COMMIT');
    
//     // Fetch the complete plan with steps
//     const completeResult = await pool.query(`
//       SELECT p.*, 
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', ps.id,
//                    'step_number', ps.step_number,
//                    'description', ps.description,
//                    'completed', ps.completed
//                  ) ORDER BY ps.step_number
//                ) FILTER (WHERE ps.id IS NOT NULL), 
//                '[]'
//              ) as plan_steps
//       FROM plans p
//       LEFT JOIN plan_steps ps ON p.id = ps.plan_id
//       WHERE p.id = $1
//       GROUP BY p.id
//     `, [plan.id]);
    
//     res.status(201).json(completeResult.rows[0]);
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error creating plan:', error);
//     res.status(500).json({ error: 'Failed to create plan' });
//   } finally {
//     client.release();
//   }
// });

// // Update a plan
// app.put('/api/plans/:id', authenticateToken, async (req, res) => {
//   const { title, description } = req.body;
//   const planId = req.params.id;
  
//   try {
//     const result = await pool.query(
//       'UPDATE plans SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
//       [title, description, planId, req.user.id]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Plan not found' });
//     }
    
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error updating plan:', error);
//     res.status(500).json({ error: 'Failed to update plan' });
//   }
// });

// // Delete a plan
// app.delete('/api/plans/:id', authenticateToken, async (req, res) => {
//   const planId = req.params.id;
  
//   try {
//     const result = await pool.query(
//       'DELETE FROM plans WHERE id = $1 AND user_id = $2 RETURNING *',
//       [planId, req.user.id]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Plan not found' });
//     }
    
//     res.json({ message: 'Plan deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting plan:', error);
//     res.status(500).json({ error: 'Failed to delete plan' });
//   }
// });

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