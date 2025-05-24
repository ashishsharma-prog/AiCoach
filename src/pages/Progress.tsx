import React from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, Award, TrendingUp, Target } from 'lucide-react';
import { formatDate, getProgressColor } from '../utils/helpers';

const Progress: React.FC = () => {
  const { user } = useUser();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Calculate statistics
  const totalGoals = user.goals.length;
  const onTrackGoals = user.goals.filter(goal => goal.progress >= 50).length;
  const totalTasks = user.goals.reduce((sum, goal) => sum + goal.tasks.length, 0);
  const completedTasks = user.goals.reduce((sum, goal) => 
    sum + goal.tasks.filter(task => task.completed).length, 0);
  
  // Sort goals by progress (descending)
  const sortedGoals = [...user.goals].sort((a, b) => b.progress - a.progress);
  
  // Mock insights data
  const insights = [
    {
      id: '1',
      title: 'Consistent Progress',
      description: 'You\'ve been making steady progress on your fitness goals over the past month.',
      date: new Date(2025, 2, 15),
      type: 'achievement' as const
    },
    {
      id: '2',
      title: 'Time Management',
      description: 'Consider dedicating specific time blocks for your learning goals to improve consistency.',
      date: new Date(2025, 2, 10),
      type: 'recommendation' as const
    },
    {
      id: '3',
      title: 'Goal Complexity',
      description: 'Your "Learn React Native" goal might benefit from being broken down into smaller milestones.',
      date: new Date(2025, 2, 5),
      type: 'challenge' as const
    }
  ];
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="text-amber-500" size={16} />;
      case 'challenge':
        return <Target className="text-red-500" size={16} />;
      case 'recommendation':
        return <TrendingUp className="text-blue-500" size={16} />;
      default:
        return <Award className="text-amber-500" size={16} />;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-600 mr-3">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Goals</p>
              <h3 className="text-xl font-bold text-gray-900">{totalGoals}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-600 mr-3">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Track</p>
              <h3 className="text-xl font-bold text-gray-900">{onTrackGoals}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-amber-100 text-amber-600 mr-3">
              <Award size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasks Completed</p>
              <h3 className="text-xl font-bold text-gray-900">{completedTasks} / {totalTasks}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <h3 className="text-lg font-medium text-gray-900">Today</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Goal Progress</h2>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              {sortedGoals.map(goal => (
                <div key={goal.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-800">{goal.title}</h3>
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(goal.progress)}`} 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{completedTasks} of {totalTasks} tasks completed</span>
                    <span>Due {formatDate(goal.targetDate)}</span>
                  </div>
                </div>
              ))}
              
              {sortedGoals.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500">No goals to track yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">AI Coach Insights</h2>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              {insights.map(insight => (
                <div key={insight.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-2">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(insight.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700">
                View All Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;