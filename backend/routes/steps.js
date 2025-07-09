const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Update plan step completion status
router.patch('/:stepId', async (req, res) => {
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

module.exports = router; 