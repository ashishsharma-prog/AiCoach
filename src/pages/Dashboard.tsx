import React from 'react';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import GoalCard from '../components/dashboard/GoalCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import CoachingPlanCard from '../components/plans/CoachingPlanCard';

const Dashboard: React.FC = () => {
  const { user, updateTask } = useUser();
  const { generatedPlans } = useChat();
  
  const handleTaskToggle = (goalId: string, taskId: string, completed: boolean) => {
    updateTask(goalId, taskId, completed);
  };
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Goals</h2>
            <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
              <span>View All</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {user.goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onTaskToggle={(taskId, completed) => handleTaskToggle(goal.id, taskId, completed)} 
              />
            ))}
          </div>
          
          {user.goals.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">You don't have any goals yet.</p>
              <button className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Coaching Plans</h2>
            <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
              <span>View All</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {generatedPlans.map((plan) => (
              <CoachingPlanCard key={plan.id} plan={plan} />
            ))}
            
            {generatedPlans.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">No coaching plans yet.</p>
                <button className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                  Generate a Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;