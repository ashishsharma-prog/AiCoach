import React from 'react';
import { CheckCircle, Circle, Calendar, MoreVertical } from 'lucide-react';
import { Goal, Task } from '../../types';
import { calculateDaysRemaining, getProgressColor, getCategoryIcon } from '../../utils/helpers';

interface GoalCardProps {
  goal: Goal;
  onTaskToggle: (taskId: string, completed: boolean) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onTaskToggle }) => {
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  const progressColor = getProgressColor(goal.progress);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getCategoryIcon(goal.category)}</span>
            <h3 className="font-medium text-gray-900">{goal.title}</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={18} />
          </button>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">{goal.description}</p>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">{goal.progress}% Complete</span>
            <span className="text-xs text-gray-500">{daysRemaining} days left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${progressColor}`} 
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {goal.tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={(completed) => onTaskToggle(task.id, completed)}
            />
          ))}
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar size={14} className="mr-1" />
          <span>Due {goal.targetDate.toLocaleDateString()}</span>
        </div>
        <button className="text-xs font-medium text-teal-600 hover:text-teal-700">
          View Details
        </button>
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onToggle: (completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  return (
    <div className="flex items-center">
      <button 
        onClick={() => onToggle(!task.completed)}
        className="flex-shrink-0 mr-2 text-gray-400 hover:text-teal-500 focus:outline-none"
      >
        {task.completed ? (
          <CheckCircle size={18} className="text-teal-500" />
        ) : (
          <Circle size={18} />
        )}
      </button>
      <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
        {task.title}
      </span>
    </div>
  );
};

export default GoalCard;