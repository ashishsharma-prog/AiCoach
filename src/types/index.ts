export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  goals: Goal[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: GoalCategory;
  tasks: Task[];
}

export type GoalCategory = 'fitness' | 'career' | 'personal' | 'education' | 'financial';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface CoachingPlan {
  id: string;
  title: string;
  description: string;
  steps: CoachingStep[];
  createdAt: Date;
  goalId: string;
}

export interface CoachingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'achievement' | 'challenge' | 'recommendation';
}