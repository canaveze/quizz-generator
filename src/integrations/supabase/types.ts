export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      Answers: {
        Row: {
          answer_id: number
          answer_text: string | null
          created_at: string
          is_correct: boolean | null
          question_id: number | null
        }
        Insert: {
          answer_id?: number
          answer_text?: string | null
          created_at?: string
          is_correct?: boolean | null
          question_id?: number | null
        }
        Update: {
          answer_id?: number
          answer_text?: string | null
          created_at?: string
          is_correct?: boolean | null
          question_id?: number | null
        }
        Relationships: []
      }
      Questions: {
        Row: {
          correct_answer_id: number | null
          created_at: string
          question_id: number
          question_text: number | null
          quiz_id: string | null
        }
        Insert: {
          correct_answer_id?: number | null
          created_at?: string
          question_id?: number
          question_text?: number | null
          quiz_id?: string | null
        }
        Update: {
          correct_answer_id?: number | null
          created_at?: string
          question_id?: number
          question_text?: number | null
          quiz_id?: string | null
        }
        Relationships: []
      }
      Quizzes: {
        Row: {
          created_at: string
          name: string | null
          objective: string | null
          prompt: string | null
          quiz_id: number
          total_questions: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string
          name?: string | null
          objective?: string | null
          prompt?: string | null
          quiz_id?: number
          total_questions?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string
          name?: string | null
          objective?: string | null
          prompt?: string | null
          quiz_id?: number
          total_questions?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      Results: {
        Row: {
          created_at: string
          quiz_id: number | null
          result_id: number
          score: number | null
          total: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string
          quiz_id?: number | null
          result_id?: number
          score?: number | null
          total?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string
          quiz_id?: number | null
          result_id?: number
          score?: number | null
          total?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      User_Answers: {
        Row: {
          answer_id: number | null
          created_at: string
          question_id: number | null
          result_id: number | null
          user_answer_id: number
        }
        Insert: {
          answer_id?: number | null
          created_at?: string
          question_id?: number | null
          result_id?: number | null
          user_answer_id?: number
        }
        Update: {
          answer_id?: number | null
          created_at?: string
          question_id?: number | null
          result_id?: number | null
          user_answer_id?: number
        }
        Relationships: []
      }
      Users: {
        Row: {
          created_at: string
          email: string | null
          name: string | null
          password_hash: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          name?: string | null
          password_hash?: string | null
          user_id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          name?: string | null
          password_hash?: string | null
          user_id?: number
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
