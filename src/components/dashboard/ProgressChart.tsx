import React from 'react';
import { Goal } from '../../types';

interface ProgressChartProps {
  goals: Goal[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ goals }) => {
  // Calculate average progress
  const averageProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;
  
  // Get goals by category
  const categoryCounts = goals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count completed tasks
  const totalTasks = goals.reduce((sum, goal) => sum + goal.tasks.length, 0);
  const completedTasks = goals.reduce((sum, goal) => 
    sum + goal.tasks.filter(task => task.completed).length, 0);
  
  const taskCompletionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-gray-900 mb-4">Progress Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Progress */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                strokeDasharray={`${averageProgress}, 100`}
                className="transition-all duration-1000"
              />
              <text x="18" y="21" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">
                {averageProgress}%
              </text>
            </svg>
          </div>
          <span className="text-sm text-gray-700">Average Progress</span>
        </div>
        
        {/* Task Completion */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeDasharray={`${taskCompletionRate}, 100`}
                className="transition-all duration-1000"
              />
              <text x="18" y="21" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">
                {taskCompletionRate}%
              </text>
            </svg>
          </div>
          <span className="text-sm text-gray-700">Tasks Completed</span>
        </div>
        
        {/* Goal Categories */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Goals by Category</h4>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="flex items-center">
                <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 capitalize">{category}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="h-1.5 rounded-full bg-teal-500" 
                      style={{ width: `${(count / goals.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for category icons
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'fitness':
      return '🏃‍♂️';
    case 'career':
      return '💼';
    case 'personal':
      return '🌱';
    case 'education':
      return '📚';
    case 'financial':
      return '💰';
    default:
      return '🎯';
  }
};

export default ProgressChart;