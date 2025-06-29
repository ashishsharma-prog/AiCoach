const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function investigateDatabase() {
  try {
    console.log('=== DATABASE INVESTIGATION ===\n');
    
    // 1. Check if plans table exists
    console.log('1. Checking if plans table exists...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'plans'
      );
    `);
    console.log('Plans table exists:', tableExists.rows[0].exists);
    
    if (!tableExists.rows[0].exists) {
      console.log('Plans table does not exist!');
      return;
    }
    
    // 2. Check all columns in plans table
    console.log('\n2. All columns in plans table:');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'plans'
      ORDER BY ordinal_position;
    `);
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // 3. Check specifically for user_id column
    console.log('\n3. user_id column details:');
    const userIdColumn = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'user_id';
    `);
    
    if (userIdColumn.rows.length > 0) {
      const col = userIdColumn.rows[0];
      console.log(`  user_id: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    } else {
      console.log('  user_id column not found!');
    }
    
    // 4. Try to insert a test record to see the exact error
    console.log('\n4. Testing insert with current schema...');
    try {
      const testInsert = await pool.query(`
        INSERT INTO plans (title, description, user_id) 
        VALUES ($1, $2, $3) 
        RETURNING id, title, user_id;
      `, ['Test Plan', 'Test Description', 'default-user-id']);
      
      console.log('Test insert successful:', testInsert.rows[0]);
      
      // Clean up test record
      await pool.query('DELETE FROM plans WHERE title = $1', ['Test Plan']);
      console.log('Test record cleaned up');
      
    } catch (insertError) {
      console.log('Test insert failed with error:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error detail:', insertError.detail);
    }
    
    // 5. Check for multiple plans tables (different schemas)
    console.log('\n5. Checking for multiple plans tables:');
    const allPlansTables = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE tablename = 'plans';
    `);
    allPlansTables.rows.forEach(table => {
      console.log(`  - Schema: ${table.schemaname}, Table: ${table.tablename}`);
    });
    
  } catch (error) {
    console.error('Investigation error:', error);
  } finally {
    await pool.end();
  }
}

investigateDatabase(); 