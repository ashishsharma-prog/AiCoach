import { createClient } from '@supabase/supabase-js';
// Replace the path below with the actual path to your Supabase types
import type { Database } from './types/supabase'; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized:', supabase);

export const createPlan = async (planData: {
  title: string;
  description: string;
  is_ai_generated: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;
    console.log('Created plan data:', data);
    return data;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
};
