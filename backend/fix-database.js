const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function fixDatabase() {
  try {
    console.log('=== FIXING DATABASE SCHEMA ===');
    
    // Check for unique constraints that might cause issues
    console.log('1. Checking constraints...');
    const constraintsResult = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'plans' AND constraint_type = 'UNIQUE'
    `);
    
    console.log('Unique constraints found:', constraintsResult.rows);
    
    // Remove problematic unique constraint if it exists
    if (constraintsResult.rows.some(row => row.constraint_name === 'plans_unique_user_id_title')) {
      console.log('Removing problematic unique constraint...');
      await pool.query(`
        ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_unique_user_id_title
      `);
      console.log('✓ Unique constraint removed!');
    }
    
    // Fix category column to allow NULL or add default
    console.log('2. Fixing category column...');
    await pool.query(`
      ALTER TABLE plans ALTER COLUMN category DROP NOT NULL
    `);
    console.log('✓ Category column now allows NULL');
    
    // Fix is_ai_generated column to have a default
    console.log('3. Fixing is_ai_generated column...');
    await pool.query(`
      ALTER TABLE plans ALTER COLUMN is_ai_generated SET DEFAULT FALSE
    `);
    console.log('✓ is_ai_generated default set');
    
    // Test insert to verify everything works
    console.log('4. Testing insert...');
    const testResult = await pool.query(`
      INSERT INTO plans (title, description) 
      VALUES ($1, $2) 
      RETURNING id, title, created_at, updated_at, category, is_ai_generated
    `, ['Test Plan - ' + Date.now(), 'Test Description']);
    
    console.log('✓ Test insert successful:', testResult.rows[0]);
    
    // Clean up test data
    await pool.query('DELETE FROM plans WHERE title LIKE $1', ['Test Plan - %']);
    console.log('✓ Test data cleaned up');
    
    console.log('=== DATABASE FIX COMPLETE ===');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase(); 