import { supabase } from './supabase';

const API_URL = 'http://localhost:3001/api';

export const getPlans = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/plans`, {
      headers: {
        'Authorization': `${session?.access_token}`,
      },
    });
    console.log(response,'response')

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

export const getPlanById = async (id: string) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/plans/${id}`, {
      headers: {
        'Authorization': `${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plan:', error);
    throw error;
  }
};