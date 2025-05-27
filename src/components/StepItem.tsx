import React, { useState } from 'react';

import { Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { PlanStep } from '../lib/types/plan';

interface StepItemProps {
  step: PlanStep;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: (stepId: string, isCompleted: boolean) => void;
}

const StepItem: React.FC<StepItemProps> = ({ 
  step,
  isExpanded,
  onToggleExpand,
  onToggleComplete
}) => {
  const [isCheckingAnimation, setIsCheckingAnimation] = useState(false);

  const handleCheckboxChange = () => {
    setIsCheckingAnimation(true);
    setTimeout(() => {
      onToggleComplete(step.id, !step.isCompleted);
      setIsCheckingAnimation(false);
    }, 300);
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <div className="flex items-start">
        <div 
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 cursor-pointer transition-all duration-300 ${
            isCheckingAnimation ? 'scale-110' : ''
          } ${
            step.isCompleted 
              ? 'bg-teal-500 border-teal-500' 
              : 'border-gray-300 hover:border-teal-400'
          }`}
          onClick={handleCheckboxChange}
        >
          {step.isCompleted && <Check size={14} className="text-white" />}
        </div>
        
        <div className="flex-grow">
          <div 
            className="flex items-center cursor-pointer"
            onClick={onToggleExpand}
          >
            <h3 className={`text-lg font-medium ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {step.title}
            </h3>
            <div className="ml-auto text-gray-500">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-3 text-gray-600 animate-fadeIn">
              <p className="mb-4">{step.description}</p>
              
              {step.resources && step.resources.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Resources:</h4>
                  <ul className="pl-4">
                    {step.resources.map(resource => (
                      <li key={resource.id} className="mb-1">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          {resource.title}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepItem;