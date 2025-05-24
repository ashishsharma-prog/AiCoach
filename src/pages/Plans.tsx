import React from 'react';
import { useChat } from '../context/ChatContext';
import { PlusCircle, Search } from 'lucide-react';
import CoachingPlanCard from '../components/plans/CoachingPlanCard';

const Plans: React.FC = () => {
  const { generatedPlans } = useChat();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaching Plans</h1>
          <p className="text-gray-600 mt-1">Your personalized guidance from the AI coach.</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
          <PlusCircle size={18} className="mr-2" />
          <span>Generate New Plan</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search plans..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <select className="ml-4 px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent">
          <option value="all">All Categories</option>
          <option value="fitness">Fitness</option>
          <option value="career">Career</option>
          <option value="personal">Personal</option>
          <option value="education">Education</option>
          <option value="financial">Financial</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedPlans.map(plan => (
          <CoachingPlanCard key={plan.id} plan={plan} />
        ))}
        
        {/* Placeholder for more plans */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
            <PlusCircle size={24} className="text-teal-600" />
          </div>
          <h3 className="font-medium text-gray-700 mb-1">Generate New Plan</h3>
          <p className="text-sm text-gray-500">Get personalized guidance based on your goals</p>
        </div>
      </div>
    </div>
  );
};

export default Plans;