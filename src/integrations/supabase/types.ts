export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_fairytales: {
        Row: {
          audio_url: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          image_url: string | null
          language: string | null
          like_count: number | null
          parameters: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          parameters?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          parameters?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      Fairytales: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: string
          image_url: string | null
          language: string | null
          like_count: number | null
          text_ru: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          text_ru?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          text_ru?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      folk_fairytales: {
        Row: {
          audio_url: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          image_url: string | null
          language: string | null
          like_count: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          language?: string | null
          like_count?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          fairytale_id: string
          fairytale_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fairytale_id: string
          fairytale_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fairytale_id?: string
          fairytale_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_fairytales: {
        Row: {
          audio_url: string | null
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          image_url: string | null
          like_count: number | null
          moderated_content: string | null
          original_content: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          like_count?: number | null
          moderated_content?: string | null
          original_content?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          like_count?: number | null
          moderated_content?: string | null
          original_content?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fairytales_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
