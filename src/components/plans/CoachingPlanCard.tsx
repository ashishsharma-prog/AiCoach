import React from 'react';
import { Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { CoachingPlan } from '../../types';
import { formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface CoachingPlanCardProps {
  plan: CoachingPlan;
}

const CoachingPlanCard: React.FC<CoachingPlanCardProps> = ({ plan }) => {
  const navigate = useNavigate();
  console.log(plan,'CoachingPlanCardProps')
  const { plan_steps = [] } = plan;
  const completedSteps = plan_steps.filter(step => step.completed).length;
  const totalSteps = plan_steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">{plan.title}</h3>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>Created on {formatDate(plan.created_at)}</span>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600">{plan.description}</p>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">
              {completedSteps} of {totalSteps} steps completed
            </span>
            <span className="text-xs text-gray-500">{progressPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-teal-500" 
              style={{ width: `${progressPercentage}` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {plan.steps.slice(0, 2).map(step => (
            <div key={step.id} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5 mr-2 text-gray-400">
                {step.completed ? (
                  <CheckCircle size={16} className="text-teal-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
              <span className={`text-sm ${step.completed ? 'text-gray-500' : 'text-gray-700'}`}>
                {step.title}
              </span>
            </div>
          ))}
          
          {totalSteps > 2 && (
            <div className="text-xs text-gray-500 pl-6">
              +{totalSteps - 2} more steps
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button 
          className="w-full flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-700"
          onClick={() => navigate(`/plans/${plan.id}`)}
        >
          <span>View Plan</span>
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default CoachingPlanCard;