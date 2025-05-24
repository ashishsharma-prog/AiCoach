import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Goal, Task } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (goalId: string, task: Task) => void;
  updateTask: (goalId: string, taskId: string, completed: boolean) => void;
  deleteTask: (goalId: string, taskId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  goals: [
    {
      id: '1',
      title: 'Run a half marathon',
      description: 'Train to complete a half marathon in under 2 hours',
      targetDate: new Date(2025, 5, 15),
      progress: 35,
      category: 'fitness',
      tasks: [
        { id: '1', title: 'Run 5km 3 times per week', completed: true },
        { id: '2', title: 'Complete 10km run', completed: false },
        { id: '3', title: 'Register for half marathon', completed: false },
      ]
    },
    {
      id: '2',
      title: 'Learn React Native',
      description: 'Build 3 mobile apps with React Native',
      targetDate: new Date(2025, 3, 1),
      progress: 20,
      category: 'education',
      tasks: [
        { id: '1', title: 'Complete React Native course', completed: false },
        { id: '2', title: 'Build a todo app', completed: true },
        { id: '3', title: 'Publish app to App Store', completed: false },
      ]
    }
  ]
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const addGoal = (goal: Goal) => {
    if (!user) return;
    setUser({ ...user, goals: [...user.goals, goal] });
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    if (!user) return;
    const updatedGoals = user.goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    setUser({ ...user, goals: updatedGoals });
  };

  const deleteGoal = (goalId: string) => {
    if (!user) return;
    setUser({ ...user, goals: user.goals.filter(goal => goal.id !== goalId) });
  };

  const addTask = (goalId: string, task: Task) => {
    if (!user) return;
    const updatedGoals = user.goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, tasks: [...goal.tasks, task] };
      }
      return goal;
    });
    setUser({ ...user, goals: updatedGoals });
  };

  const updateTask = (goalId: string, taskId: string, completed: boolean) => {
    if (!user) return;
    const updatedGoals = user.goals.map(goal => {
      if (goal.id === goalId) {
        const updatedTasks = goal.tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        );
        return { ...goal, tasks: updatedTasks };
      }
      return goal;
    });
    setUser({ ...user, goals: updatedGoals });
  };

  const deleteTask = (goalId: string, taskId: string) => {
    if (!user) return;
    const updatedGoals = user.goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, tasks: goal.tasks.filter(task => task.id !== taskId) };
      }
      return goal;
    });
    setUser({ ...user, goals: updatedGoals });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading,
      setUser, 
      addGoal, 
      updateGoal, 
      deleteGoal,
      addTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};