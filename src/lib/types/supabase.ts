export type Database = {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          title: string
          description: string
          is_ai_generated: boolean
          created_at: string
        }
        Insert: {
          title: string
          description: string
          is_ai_generated: boolean
        }
        Update: {
          title?: string
          description?: string
          is_ai_generated?: boolean
        }
      }
    }
  }
} 