export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      featured_products: {
        Row: {
          analysis_context: Json | null
          brand: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_average: number | null
          score_mestre: number | null
          seal_type: string
          store_link: string | null
          updated_at: string
        }
        Insert: {
          analysis_context?: Json | null
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_average?: number | null
          score_mestre?: number | null
          seal_type: string
          store_link?: string | null
          updated_at?: string
        }
        Update: {
          analysis_context?: Json | null
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_average?: number | null
          score_mestre?: number | null
          seal_type?: string
          store_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          processed_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          processed_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          processed_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_cache: {
        Row: {
          average_price: number | null
          brand: string | null
          cache_key: string
          confidence_level: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          max_price: number | null
          min_price: number | null
          prices: Json | null
          product_name: string
        }
        Insert: {
          average_price?: number | null
          brand?: string | null
          cache_key: string
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          max_price?: number | null
          min_price?: number | null
          prices?: Json | null
          product_name: string
        }
        Update: {
          average_price?: number | null
          brand?: string | null
          cache_key?: string
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          max_price?: number | null
          min_price?: number | null
          prices?: Json | null
          product_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          plan: string
          selected_assistant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          plan?: string
          selected_assistant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          plan?: string
          selected_assistant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_itineraries: {
        Row: {
          budget: number | null
          created_at: string
          departure_date: string | null
          destination: string
          id: string
          itinerary_data: Json
          return_date: string | null
          title: string
          travel_style: string
          travelers_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          departure_date?: string | null
          destination: string
          id?: string
          itinerary_data: Json
          return_date?: string | null
          title: string
          travel_style: string
          travelers_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          departure_date?: string | null
          destination?: string
          id?: string
          itinerary_data?: Json
          return_date?: string | null
          title?: string
          travel_style?: string
          travelers_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_petitions: {
        Row: {
          case_details: Json | null
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_details?: Json | null
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_details?: Json | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_product_recommendations: {
        Row: {
          created_at: string
          featured_products: Json | null
          id: string
          query: string
          recommendations: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          featured_products?: Json | null
          id?: string
          query: string
          recommendations: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          featured_products?: Json | null
          id?: string
          query?: string
          recommendations?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_travel_plans: {
        Row: {
          budget_info: Json | null
          created_at: string
          destination: string
          id: string
          itinerary: Json
          travel_dates: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_info?: Json | null
          created_at?: string
          destination: string
          id?: string
          itinerary: Json
          travel_dates?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_info?: Json | null
          created_at?: string
          destination?: string
          id?: string
          itinerary?: Json
          travel_dates?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_financial_data: {
        Row: {
          created_at: string
          dividas: number | null
          gastos_fixes: number
          gastos_variaveis: number
          id: string
          investimentos: number | null
          meta_economia: number | null
          objetivos: string[] | null
          renda: number
          reserva_emergencia: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dividas?: number | null
          gastos_fixes: number
          gastos_variaveis: number
          id?: string
          investimentos?: number | null
          meta_economia?: number | null
          objetivos?: string[] | null
          renda: number
          reserva_emergencia?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dividas?: number | null
          gastos_fixes?: number
          gastos_variaveis?: number
          id?: string
          investimentos?: number | null
          meta_economia?: number | null
          objetivos?: string[] | null
          renda?: number
          reserva_emergencia?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          chunk_text: string
          chunk_index: number
          knowledge_base: Json
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
