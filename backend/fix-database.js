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
    console.log('Checking database schema...');
    
    // Check current column type
    const checkResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'user_id'
    `);
    
    console.log('Current user_id column type:', checkResult.rows[0]);
    
    if (checkResult.rows[0] && checkResult.rows[0].data_type !== 'character varying') {
      console.log('Fixing user_id column type...');
      
      // Alter the column type to VARCHAR
      await pool.query(`
        ALTER TABLE plans ALTER COLUMN user_id TYPE VARCHAR(255)
      `);
      
      console.log('user_id column type fixed successfully!');
    } else {
      console.log('user_id column type is already correct.');
    }
    
    // Verify the fix
    const verifyResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'user_id'
    `);
    
    console.log('Updated user_id column type:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase(); 