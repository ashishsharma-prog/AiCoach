import React, { useEffect, useState } from 'react';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProgressChart from '../components/dashboard/ProgressChart';
import CoachingPlanCard from '../components/plans/CoachingPlanCard';
import { getPlans } from '../lib/api';
import { Plan } from '../lib/types/plan';

const Dashboard: React.FC = () => {
  console.log('check')
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await getPlans();
        setPlans(fetchedPlans);
        setError(null);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans. Please check your connection.');
        // Set empty plans array to prevent further errors
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-1">Track your progress and stay motivated.</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
          <PlusCircle size={18} className="mr-2" />
          <span>New Goal</span>
        </button>
      </div>
      
      <ProgressChart goals={user.goals} />
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Coaching Plans</h2>
          <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
            <span>View All</span>
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <CoachingPlanCard key={plan.id} plan={plan} />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">No coaching plans yet.</p>
              <button className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                Generate a Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;