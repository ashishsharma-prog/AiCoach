import { API_URL } from '../constant';

export const getPlans = async () => {
  try {
    const token = localStorage.getItem('jwt');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/plans`, {
      headers,
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
    const token = localStorage.getItem('jwt');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/plans/${id}`, {
      headers,
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

export const updatePlanStep = async (planId: string, stepId: string, isCompleted: boolean) => {
  try {
    const token = localStorage.getItem('jwt');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/plans/${planId}/steps/${stepId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_completed: isCompleted })
    });

    if (!response.ok) {
      throw new Error('Failed to update step status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating step:', error);
    throw error;
  }
};