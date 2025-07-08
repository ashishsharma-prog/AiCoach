-- Database setup script for AiCoach application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a dummy user
INSERT INTO users (name, email, password_hash)
VALUES ('Demo User', 'demo@example.com', 'demo_hashed_password')
ON CONFLICT (email) DO NOTHING;

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT plans_title_not_empty CHECK (title != '')
);

-- Create plan_steps table
CREATE TABLE IF NOT EXISTS plan_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT plan_steps_order_unique UNIQUE (plan_id, order_number),
    CONSTRAINT plan_steps_title_not_empty CHECK (title != ''),
    CONSTRAINT plan_steps_order_positive CHECK (order_number > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plan_steps_plan_id ON plan_steps(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_steps_order ON plan_steps(plan_id, order_number);
CREATE INDEX IF NOT EXISTS idx_plan_steps_completed ON plan_steps(is_completed);

-- Create trigger to automatically update updated_at timestamp for plans
CREATE OR REPLACE FUNCTION update_plans_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_plans_updated_at_column();

-- Create trigger to automatically update updated_at timestamp for plan_steps
CREATE OR REPLACE FUNCTION update_plan_steps_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plan_steps_updated_at 
    BEFORE UPDATE ON plan_steps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_plan_steps_updated_at_column();

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW plan_steps_with_plan AS
SELECT 
    ps.id,
    ps.plan_id,
    p.title as plan_title,
    ps.title as step_title,
    ps.description,
    ps.order_number,
    ps.is_completed,
    ps.created_at,
    ps.updated_at
FROM plan_steps ps
JOIN plans p ON ps.plan_id = p.id
ORDER BY ps.plan_id, ps.order_number; 