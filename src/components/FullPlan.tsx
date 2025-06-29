import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { getPlanById } from '../lib/api';
// import { getPlanById, updatePlanStep } from '../services/planService';

interface PlanStep {
  id: string;
  title: string;
  description: string;
  order_number: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  category: string | null;
  is_ai_generated: boolean;
  plan_steps: PlanStep[];
}

const FullPlan: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      
      try {
        setLoading(true);
        const planData = await getPlanById(planId);
        
        if (!planData) {
          setError('Plan not found');
          return;
        }
        
        setPlan(planData);
      } catch (err) {
        setError('Failed to load plan');
        console.error('Error loading plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleToggleComplete = async (stepId: string, isCompleted: boolean) => {
    if (!plan || !planId) return;
    
    try {
      // Optimistically update UI
      setPlan(prevPlan => {
        if (!prevPlan) return null;
        
        return {
          ...prevPlan,
          plan_steps: prevPlan.plan_steps.map(step => 
            step.id === stepId ? { ...step, completed: isCompleted } : step
          )
        };
      });

      // Update in database
      const response = await fetch(`http://localhost:3001/api/plans/${planId}/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: isCompleted })
      });

      if (!response.ok) {
        throw new Error('Failed to update step status');
      }

    } catch (err) {
      console.error('Failed to update step status', err);
      // Revert optimistic update on error
      setPlan(prevPlan => {
        if (!prevPlan) return null;
        
        return {
          ...prevPlan,
          plan_steps: prevPlan.plan_steps.map(step => 
            step.id === stepId ? { ...step, completed: !isCompleted } : step
          )
        };
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Plan</h2>
        <p className="text-gray-600 mb-4">{error || 'Plan not found'}</p>
        <button
          onClick={() => navigate('/plans')}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  const completedSteps = plan.plan_steps.filter(step => step.completed).length;
  const totalSteps = plan.plan_steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to Plans</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
          
          <div className="flex items-center text-gray-500 mt-2">
            <Calendar size={18} className="mr-2" />
            <span>Created on {formatDate(plan.created_at)}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Plan Description */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Overview</h2>
            <p className="text-gray-600">{plan.description}</p>
            {plan.is_ai_generated && (
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                AI Generated Plan
              </span>
            )}
          </div>
          
          {/* Progress */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Progress</h3>
              <span className="text-sm font-medium text-gray-500">
                {completedSteps} of {totalSteps} steps completed ({Math.round(progressPercentage)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-teal-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Steps */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Steps to Complete</h2>
            
            <div className="divide-y divide-gray-200">
              {plan.plan_steps
                .sort((a, b) => a.order_number - b.order_number)
                .map(step => (
                  <div key={step.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={(e) => handleToggleComplete(step.id, e.target.checked)}
                            className="h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                          />
                          <h3 className="ml-3 text-lg font-medium text-gray-900">{step.title}</h3>
                        </div>
                        <p className="mt-2 text-gray-600">{step.description}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Created: {formatDate(step.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-teal-800 mb-1">Need assistance with this plan?</h3>
            <p className="text-teal-600">Our AI coach is available to answer questions and provide guidance.</p>
          </div>
          <button className="mt-4 sm:mt-0 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            Chat with Coach
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullPlan;