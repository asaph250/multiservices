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
      government_services: {
        Row: {
          id: string;
          client_name: string;
          request_type: string;
          description: string;
          status: string;
          assigned_to: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          request_type: string;
          description: string;
          status?: string;
          assigned_to?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          request_type?: string;
          description?: string;
          status?: string;
          assigned_to?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      agent_payouts: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          paid_at: string | null
          status: string
          tasks_completed: number
          total_commission: number
          updated_at: string
          week_end: string
          week_start: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string
          tasks_completed?: number
          total_commission?: number
          updated_at?: string
          week_end: string
          week_start: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string
          tasks_completed?: number
          total_commission?: number
          updated_at?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          agent_id: string
          assigned_at: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          service_request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          skills: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_group_memberships: {
        Row: {
          created_at: string
          customer_id: string
          group_id: string
          id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          group_id: string
          id?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_group_memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "customer_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          last_message_sent: string | null
          name: string
          phone_number: string
          segment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_sent?: string | null
          name: string
          phone_number: string
          segment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_sent?: string | null
          name?: string
          phone_number?: string
          segment?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          ip_address: string | null
          login_attempt_at: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          login_attempt_at?: string
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          login_attempt_at?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      message_analytics: {
        Row: {
          created_at: string
          date: string
          delivered_count: number | null
          id: string
          message_id: string | null
          read_count: number | null
          response_count: number | null
          sent_count: number | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          delivered_count?: number | null
          id?: string
          message_id?: string | null
          read_count?: number | null
          response_count?: number | null
          sent_count?: number | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          delivered_count?: number | null
          id?: string
          message_id?: string | null
          read_count?: number | null
          response_count?: number | null
          sent_count?: number | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_history: {
        Row: {
          created_at: string
          customer_count: number
          id: string
          message_body: string | null
          message_text: string | null
          message_title: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_count?: number
          id?: string
          message_body?: string | null
          message_text?: string | null
          message_title?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_count?: number
          id?: string
          message_body?: string | null
          message_text?: string | null
          message_title?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_logs: {
        Row: {
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_status: string
          error_message: string | null
          id: string
          message_id: string
          phone_number: string
          platform: string | null
          read_at: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_status?: string
          error_message?: string | null
          id?: string
          message_id: string
          phone_number: string
          platform?: string | null
          read_at?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_status?: string
          error_message?: string | null
          id?: string
          message_id?: string
          phone_number?: string
          platform?: string | null
          read_at?: string | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          message_type: string | null
          recipient_count: number | null
          scheduled_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          message_type?: string | null
          recipient_count?: number | null
          scheduled_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          message_type?: string | null
          recipient_count?: number | null
          scheduled_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          error_message: string | null
          id: string
          payment_method: string
          phone_number: string | null
          processed_at: string | null
          reference_number: string | null
          status: string
          subscription_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          payment_method: string
          phone_number?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          payment_method?: string
          phone_number?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string
          customer_count: number
          customer_ids: Json
          id: string
          message_body: string
          message_title: string
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_count?: number
          customer_ids?: Json
          id?: string
          message_body: string
          message_title: string
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_count?: number
          customer_ids?: Json
          id?: string
          message_body?: string
          message_title?: string
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          client_id: string | null
          created_at: string
          document_details: string | null
          file_url: string | null
          file_urls: Json | null
          full_name: string
          id: string
          notes: string | null
          phone_number: string
          service_type: string
          status: Database["public"]["Enums"]["service_request_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          document_details?: string | null
          file_url?: string | null
          file_urls?: Json | null
          full_name: string
          id?: string
          notes?: string | null
          phone_number: string
          service_type: string
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          document_details?: string | null
          file_url?: string | null
          file_urls?: Json | null
          full_name?: string
          id?: string
          notes?: string | null
          phone_number?: string
          service_type?: string
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          currency: string | null
          end_date: string | null
          id: string
          plan_type: string
          price_paid: number | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_type: string
          price_paid?: number | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_type?: string
          price_paid?: number | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          admin_id: string | null
          agent_id: string | null
          agent_notes: string | null
          client_name: string
          commission_rate: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          price: number
          result_file_url: string | null
          service_request_id: string | null
          service_type: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          agent_id?: string | null
          agent_notes?: string | null
          client_name: string
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          price: number
          result_file_url?: string | null
          service_request_id?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          agent_id?: string | null
          agent_notes?: string | null
          client_name?: string
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          result_file_url?: string | null
          service_request_id?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          date_format: string | null
          email_notifications: boolean | null
          id: string
          language: string
          marketing_emails: boolean | null
          payment_status: string | null
          sms_notifications: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          date_format?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string
          marketing_emails?: boolean | null
          payment_status?: string | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          date_format?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string
          marketing_emails?: boolean | null
          payment_status?: string | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
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
      service_request_status:
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "converted_to_task"
      task_status:
        | "pending"
        | "approved"
        | "completed"
        | "cancelled"
        | "submitted_for_review"
      user_role: "admin" | "agent" | "client"
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
      service_request_status: [
        "pending",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
        "converted_to_task",
      ],
      task_status: [
        "pending",
        "approved",
        "completed",
        "cancelled",
        "submitted_for_review",
      ],
      user_role: ["admin", "agent", "client"],
    },
  },
} as const
