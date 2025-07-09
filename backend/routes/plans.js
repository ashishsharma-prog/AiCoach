const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateJWT = require('../middleware/auth');

// Protect all routes
router.use(authenticateJWT);

// ===== PLANS API ROUTES =====

// Get all plans for the authenticated user
router.get('/', async (req, res) => {
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
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans', details: error.message });
  }
});

// Get a single plan by ID
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
  const { title, description, steps, category, is_ai_generated = false } = req.body;
  
  // console.log('Received plan creation request:', { title, description, steps, category, is_ai_generated });
  
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
      [title, description, category, is_ai_generated, req.user.id]
    );
    
    const plan = planResult.rows[0];
    // console.log('Plan created:', plan);
    
    // Insert plan steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await client.query(
          `INSERT INTO plan_steps (plan_id, title, description, order_number) 
           VALUES ($1, $2, $3, $4)`,
          [plan.id, step.title, step.description, step.order || i + 1]
        );
      }
      
      // console.log(`Inserted ${steps.length} steps`);
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

// ===== END PLANS API ROUTES =====

module.exports = router; 