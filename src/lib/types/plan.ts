export interface Plan {
    id: string;
    title: string;
    description: string;
    created_at: string;
    category?: string;
    is_ai_generated?: boolean;
    user_id?: string;
    updated_at?: string;
    plan_steps: PlanStep[];
  }
  
  export interface PlanStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    order_number: number;
    resources?: PlanResource[];
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PlanResource {
    id: string;
    title: string;
    url: string;
    type: 'article' | 'video' | 'exercise' | 'other';
  }