export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          current_level: string;
          xp: number;
          streak_days: number;
          last_study_date: string | null;
          daily_goal_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'|'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      card_reviews: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          level: string;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          next_review_at: string;
          last_reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['card_reviews']['Row'], 'id'|'created_at'>;
        Update: Partial<Database['public']['Tables']['card_reviews']['Insert']>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          level: string;
          exercise_type: string;
          cards_reviewed: number;
          correct: number;
          xp_earned: number;
          duration_seconds: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['study_sessions']['Row'], 'id'|'created_at'>;
        Update: Partial<Database['public']['Tables']['study_sessions']['Insert']>;
      };
    };
  };
}

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ExerciseMode = 'flashcard' | 'fillBlank' | 'multipleChoice';
export type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  level: Level;
  category: string;
  front: string;
  back: string;
  example: string;
  example_es: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_level: Level;
  xp: number;
  streak_days: number;
  last_study_date: string | null;
  daily_goal_minutes: number;

  // Nuevos campos
  total_words_learned: number;
  total_sessions: number;
  best_streak: number;
  daily_goal: number;
}

export interface LevelInfo {
  id: Level;
  name: string;
  description: string;
  totalCards: number;
  minXP: number;
}
