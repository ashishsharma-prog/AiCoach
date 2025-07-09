const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    // Add provider and provider_id columns if not exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='provider') THEN
          ALTER TABLE users ADD COLUMN provider VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='provider_id') THEN
          ALTER TABLE users ADD COLUMN provider_id VARCHAR(100);
        END IF;
      END$$;
    `);
    
    console.log('Database setup completed successfully!');
    
    // Test the connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 