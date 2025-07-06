import { API_URL } from '../constant';

export const getPlans = async () => {
  console.log('getPlans')
  try {
    const response = await fetch(`${API_URL}/plans`);
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
    const response = await fetch(`${API_URL}/plans/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plan:', error);
    throw error;
  }
};