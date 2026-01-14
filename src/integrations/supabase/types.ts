export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          area: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          email: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          email?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          email?: string | null
        }
        Relationships: []
      }
      progress_updates: {
        Row: {
          attachments: string[] | null
          created_at: string
          created_by: string | null
          id: string
          location_lat: number | null
          location_lon: number | null
          message: string
          source: string
          status_after_update:
            | Database["public"]["Enums"]["ticket_status"]
            | null
          ticket_id: string
          timestamp: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          message: string
          source: string
          status_after_update?:
            | Database["public"]["Enums"]["ticket_status"]
            | null
          ticket_id: string
          timestamp?: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          message?: string
          source?: string
          status_after_update?:
            | Database["public"]["Enums"]["ticket_status"]
            | null
          ticket_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_updates_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      teknisi: {
        Row: {
          area: string | null
          created_at: string
          employee_id: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          admin_notes: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          id: string
          inc_gamas: string | null
          inc_numbers: string[]
          is_permanent: boolean
          jam_open: string
          jarak_km_range: string | null
          kategori: string
          kjd: string | null
          latitude: number | null
          lokasi_text: string
          longitude: number | null
          max_jam_close: string
          network_element: string | null
          penyebab: string | null
          permanent_notes: string | null
          provider: string
          raw_ticket_text: string | null
          segmen: string | null
          sisa_ttr_hours: number
          site_code: string
          site_name: string
          status: Database["public"]["Enums"]["ticket_status"]
          teknisi_list: string[] | null
          ttr_compliance: Database["public"]["Enums"]["ttr_compliance"]
          ttr_real_hours: number | null
          ttr_target_hours: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inc_gamas?: string | null
          inc_numbers?: string[]
          is_permanent?: boolean
          jam_open?: string
          jarak_km_range?: string | null
          kategori: string
          kjd?: string | null
          latitude?: number | null
          lokasi_text: string
          longitude?: number | null
          max_jam_close: string
          network_element?: string | null
          penyebab?: string | null
          permanent_notes?: string | null
          provider?: string
          raw_ticket_text?: string | null
          segmen?: string | null
          sisa_ttr_hours?: number
          site_code: string
          site_name: string
          status?: Database["public"]["Enums"]["ticket_status"]
          teknisi_list?: string[] | null
          ttr_compliance?: Database["public"]["Enums"]["ttr_compliance"]
          ttr_real_hours?: number | null
          ttr_target_hours?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inc_gamas?: string | null
          inc_numbers?: string[]
          is_permanent?: boolean
          jam_open?: string
          jarak_km_range?: string | null
          kategori?: string
          kjd?: string | null
          latitude?: number | null
          lokasi_text?: string
          longitude?: number | null
          max_jam_close?: string
          network_element?: string | null
          penyebab?: string | null
          permanent_notes?: string | null
          provider?: string
          raw_ticket_text?: string | null
          segmen?: string | null
          sisa_ttr_hours?: number
          site_code?: string
          site_name?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          teknisi_list?: string[] | null
          ttr_compliance?: Database["public"]["Enums"]["ttr_compliance"]
          ttr_real_hours?: number | null
          ttr_target_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hd" | "guest"
      ticket_status:
        | "OPEN"
        | "ASSIGNED"
        | "ONPROGRESS"
        | "PENDING"
        | "TEMPORARY"
        | "WAITING_MATERIAL"
        | "WAITING_ACCESS"
        | "WAITING_COORDINATION"
        | "CLOSED"
      ttr_compliance: "COMPLY" | "NOT COMPLY"
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
    Enums: {
      app_role: ["admin", "hd", "guest"],
      ticket_status: [
        "OPEN",
        "ASSIGNED",
        "ONPROGRESS",
        "PENDING",
        "TEMPORARY",
        "WAITING_MATERIAL",
        "WAITING_ACCESS",
        "WAITING_COORDINATION",
        "CLOSED",
      ],
      ttr_compliance: ["COMPLY", "NOT COMPLY"],
    },
  },
} as const
