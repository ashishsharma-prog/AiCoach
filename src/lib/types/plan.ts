export interface Plan {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    category?: string;
    steps: PlanStep[];
  }
  
  export interface PlanStep {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    order: number;
    resources?: PlanResource[];
  }
  
  export interface PlanResource {
    id: string;
    title: string;
    url: string;
    type: 'article' | 'video' | 'exercise' | 'other';
  }