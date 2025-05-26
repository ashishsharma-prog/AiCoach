import { createClient } from '@supabase/supabase-js';
// Replace the path below with the actual path to your Supabase types
import type { Database } from './types/supabase'; 

const supabaseUrl = 'https://jpnhdfudxlwbtodfflky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbmhkZnVkeGx3YnRvZGZmbGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzI2MjYsImV4cCI6MjA2MzYwODYyNn0.hamkHFYCWi4LJU37I905i4lx-WIXEtTVuWq1liK2B1k';

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
