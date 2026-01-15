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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          page_slug: string
          page_title: string
          published_at: string | null
          updated_at: string
          updated_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          page_slug: string
          page_title: string
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          page_slug?: string
          page_title?: string
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      cms_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean | null
          page_id: string
          section_key: string
          section_type: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_visible?: boolean | null
          page_id: string
          section_key: string
          section_type: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean | null
          page_id?: string
          section_key?: string
          section_type?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          sale_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          sale_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          sale_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          total_due: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          total_due?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_due?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_costs: {
        Row: {
          amount: number
          category: string
          cost_date: string
          created_at: string
          description: string
          id: string
          notes: string | null
          payment_method: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          admin_user_id: string
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          session_token: string
          target_user_id: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          ended_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          session_token: string
          target_user_id: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          session_token?: string
          target_user_id?: string
        }
        Relationships: []
      }
      manufacturers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicine_batches: {
        Row: {
          batch_number: string
          created_at: string
          expiry_date: string
          id: string
          manufactured_date: string | null
          medicine_id: string
          notes: string | null
          purchase_price: number
          quantity: number
          selling_price: number
          supplier_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiry_date: string
          id?: string
          manufactured_date?: string | null
          medicine_id: string
          notes?: string | null
          purchase_price?: number
          quantity?: number
          selling_price?: number
          supplier_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiry_date?: string
          id?: string
          manufactured_date?: string | null
          medicine_id?: string
          notes?: string | null
          purchase_price?: number
          quantity?: number
          selling_price?: number
          supplier_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_batches_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          category: string | null
          created_at: string
          generic_name: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          manufacturer_id: string | null
          min_stock_level: number | null
          name: string
          shelf_location: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          manufacturer_id?: string | null
          min_stock_level?: number | null
          name: string
          shelf_location?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          manufacturer_id?: string | null
          min_stock_level?: number | null
          name?: string
          shelf_location?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_cash: {
        Row: {
          amount: number
          cash_date: string
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          cash_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          cash_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          currency: string
          display_name: string
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          plan_name: string
          price: number
          sort_order: number | null
          trial_restrictions: Json | null
          updated_at: string
          user_limit: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          display_name: string
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name: string
          price?: number
          sort_order?: number | null
          trial_restrictions?: Json | null
          updated_at?: string
          user_limit?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          display_name?: string
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name?: string
          price?: number
          sort_order?: number | null
          trial_restrictions?: Json | null
          updated_at?: string
          user_limit?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          pharmacy_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          pharmacy_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          pharmacy_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          batch_id: string | null
          batch_number: string | null
          created_at: string
          id: string
          medicine_id: string | null
          medicine_name: string
          quantity: number
          sale_id: string
          sale_unit: string
          total_price: number
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string
          id?: string
          medicine_id?: string | null
          medicine_name: string
          quantity: number
          sale_id: string
          sale_unit?: string
          total_price: number
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string
          id?: string
          medicine_id?: string | null
          medicine_name?: string
          quantity?: number
          sale_id?: string
          sale_unit?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "medicine_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          discount: number
          due_amount: number
          entry_type: string
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          payment_method: string
          sale_date: string
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          due_amount?: number
          entry_type?: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string
          sale_date?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          due_amount?: number
          entry_type?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string
          sale_date?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_order_items: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          medicine_id: string
          medicine_name: string
          min_stock_level: number
          notes: string | null
          order_id: string
          quantity_to_order: number
          unit: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          medicine_id: string
          medicine_name: string
          min_stock_level?: number
          notes?: string | null
          order_id: string
          quantity_to_order?: number
          unit?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          medicine_id?: string
          medicine_name?: string
          min_stock_level?: number
          notes?: string | null
          order_id?: string
          quantity_to_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "stock_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_orders: {
        Row: {
          created_at: string
          id: string
          manufacturer: string
          manufacturer_phone: string | null
          notes: string | null
          received_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manufacturer: string
          manufacturer_phone?: string | null
          notes?: string | null
          received_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manufacturer?: string
          manufacturer_phone?: string | null
          notes?: string | null
          received_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string
          id: string
          lifetime_service_due_date: string | null
          notes: string | null
          payment_method: string | null
          plan_type: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          lifetime_service_due_date?: string | null
          notes?: string | null
          payment_method?: string | null
          plan_type?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          lifetime_service_due_date?: string | null
          notes?: string | null
          payment_method?: string | null
          plan_type?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
          supplier_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          supplier_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_purchases: {
        Row: {
          created_at: string
          due_amount: number
          id: string
          invoice_number: string | null
          notes: string | null
          paid_amount: number
          purchase_date: string
          supplier_id: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_amount?: number
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number
          purchase_date?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_amount?: number
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number
          purchase_date?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          total_due: number
          total_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          total_due?: number
          total_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_due?: number
          total_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_invoice_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_details?: Json
          p_target_id?: string
          p_target_type: string
          p_target_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "owner_admin" | "client_admin" | "client_staff"
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
      app_role: ["owner_admin", "client_admin", "client_staff"],
    },
  },
} as const
