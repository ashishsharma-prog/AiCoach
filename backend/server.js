const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_ACCESS_TOKEN
);

// Get all plans for a user
app.get('/api/plans', async (req, res) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: plans, error } = await supabase
      .from('plans')
      .select(`
        *,
        plan_steps (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single plan by ID
app.get('/api/plans/:id', async (req, res) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: plan, error } = await supabase
      .from('plans')
      .select(`
        *,
        plan_steps (*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});