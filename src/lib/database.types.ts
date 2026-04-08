export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_quality: number
          energy_level: number
          focus_level: number
          stress_level: number
          body_feeling: number
          mood: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sleep_quality: number
          energy_level: number
          focus_level: number
          stress_level: number
          body_feeling: number
          mood: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          sleep_quality?: number
          energy_level?: number
          focus_level?: number
          stress_level?: number
          body_feeling?: number
          mood?: number
          note?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          primary_goal: string | null
          challenge_name: string | null
          current_supplements: string[] | null
          has_completed_onboarding: boolean
          created_at: string
        }
        Insert: {
          id: string
          primary_goal?: string | null
          challenge_name?: string | null
          current_supplements?: string[] | null
          has_completed_onboarding?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          primary_goal?: string | null
          challenge_name?: string | null
          current_supplements?: string[] | null
          has_completed_onboarding?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
