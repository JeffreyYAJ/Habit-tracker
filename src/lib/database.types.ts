export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          name: string;
          month: number;
          year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          month: number;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          month?: number;
          year?: number;
          created_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          day_number: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          day_number: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          day_number?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
