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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          created_at: string | null
          id: string
          is_per_night: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_per_night?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_per_night?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      booking_addons: {
        Row: {
          addon_id: string
          booking_id: string
          id: string
          price_at_booking: number
        }
        Insert: {
          addon_id: string
          booking_id: string
          id?: string
          price_at_booking: number
        }
        Update: {
          addon_id?: string
          booking_id?: string
          id?: string
          price_at_booking?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          camper_id: string
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
        Insert: {
          camper_id: string
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
        }
        Update: {
          camper_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_camper_id_fkey"
            columns: ["camper_id"]
            isOneToOne: false
            referencedRelation: "campers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camper_features: {
        Row: {
          camper_id: string | null
          feature_id: string | null
          id: string
        }
        Insert: {
          camper_id?: string | null
          feature_id?: string | null
          id?: string
        }
        Update: {
          camper_id?: string | null
          feature_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camper_features_camper_id_fkey"
            columns: ["camper_id"]
            isOneToOne: false
            referencedRelation: "campers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camper_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      camper_images: {
        Row: {
          camper_id: string | null
          created_at: string
          id: string
          image_path: string | null
          is_primary: boolean | null
        }
        Insert: {
          camper_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          is_primary?: boolean | null
        }
        Update: {
          camper_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "camper_images_camper_id_fkey"
            columns: ["camper_id"]
            isOneToOne: false
            referencedRelation: "campers"
            referencedColumns: ["id"]
          },
        ]
      }
      campers: {
        Row: {
          beds: number | null
          cleaning_fee: number
          created_at: string
          deposit_amount: number
          description: string
          empty_weight_kg: number | null
          engine_power: number | null
          fuel_consumption: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          has_tow_hitch: boolean | null
          height_cm: number | null
          id: string
          length_cm: number | null
          manufacturer: Database["public"]["Enums"]["manufacturers"]
          max_towing_capacity_kg: number | null
          max_weight_kg: number | null
          name: string | null
          price_per_night_base: number
          required_license: string
          short_desc: string
          width_cm: number | null
        }
        Insert: {
          beds?: number | null
          cleaning_fee?: number
          created_at?: string
          deposit_amount?: number
          description?: string
          empty_weight_kg?: number | null
          engine_power?: number | null
          fuel_consumption?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          has_tow_hitch?: boolean | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          manufacturer: Database["public"]["Enums"]["manufacturers"]
          max_towing_capacity_kg?: number | null
          max_weight_kg?: number | null
          name?: string | null
          price_per_night_base?: number
          required_license: string
          short_desc?: string
          width_cm?: number | null
        }
        Update: {
          beds?: number | null
          cleaning_fee?: number
          created_at?: string
          deposit_amount?: number
          description?: string
          empty_weight_kg?: number | null
          engine_power?: number | null
          fuel_consumption?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          has_tow_hitch?: boolean | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          manufacturer?: Database["public"]["Enums"]["manufacturers"]
          max_towing_capacity_kg?: number | null
          max_weight_kg?: number | null
          name?: string | null
          price_per_night_base?: number
          required_license?: string
          short_desc?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campers_required_license_fkey"
            columns: ["required_license"]
            isOneToOne: false
            referencedRelation: "drivers_license"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers_license: {
        Row: {
          class: Database["public"]["Enums"]["drivers_licenses"] | null
          created_at: string
          id: string
          max_trailer_weight: number | null
          max_vehicle_wieght: number | null
          total_weight: number | null
          value: number | null
        }
        Insert: {
          class?: Database["public"]["Enums"]["drivers_licenses"] | null
          created_at?: string
          id?: string
          max_trailer_weight?: number | null
          max_vehicle_wieght?: number | null
          total_weight?: number | null
          value?: number | null
        }
        Update: {
          class?: Database["public"]["Enums"]["drivers_licenses"] | null
          created_at?: string
          id?: string
          max_trailer_weight?: number | null
          max_vehicle_wieght?: number | null
          total_weight?: number | null
          value?: number | null
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          description: string | null
          id: number
          rule_key: string
          rule_value: number
        }
        Insert: {
          description?: string | null
          id?: number
          rule_key: string
          rule_value: number
        }
        Update: {
          description?: string | null
          id?: number
          rule_key?: string
          rule_value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          drivers_license_class: string | null
          first_name: string
          id: string
          is_admin: boolean
          is_provider: boolean
          is_renter: boolean
          last_name: string
          updated_at: string | null
        }
        Insert: {
          drivers_license_class?: string | null
          first_name: string
          id: string
          is_admin?: boolean
          is_provider?: boolean
          is_renter?: boolean
          last_name: string
          updated_at?: string | null
        }
        Update: {
          drivers_license_class?: string | null
          first_name?: string
          id?: string
          is_admin?: boolean
          is_provider?: boolean
          is_renter?: boolean
          last_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_drivers_license_class_fkey"
            columns: ["drivers_license_class"]
            isOneToOne: false
            referencedRelation: "drivers_license"
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
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      drivers_licenses:
        | "Klasse B"
        | "Klasse B96"
        | "Klasse BE"
        | "Klasse C1"
        | "Klasse C1E"
        | "Klasse C"
        | "Klasse CE"
        | "alte Klasse 3"
        | "alte Klasse 2"
      fuel_type: "Diesel" | "Super" | "Super Plus" | "Super E10"
      manufacturers:
        | "Rolls-Boyce"
        | "Folkwagen"
        | "Mercedenz-Bonz"
        | "Avdi"
        | "DYB"
        | "Tayota"
        | "Sabaru"
        | "Chervolet"
        | "Ferraro"
        | "Lamberghini"
        | "Bandley"
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
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      drivers_licenses: [
        "Klasse B",
        "Klasse B96",
        "Klasse BE",
        "Klasse C1",
        "Klasse C1E",
        "Klasse C",
        "Klasse CE",
        "alte Klasse 3",
        "alte Klasse 2",
      ],
      fuel_type: ["Diesel", "Super", "Super Plus", "Super E10"],
      manufacturers: [
        "Rolls-Boyce",
        "Folkwagen",
        "Mercedenz-Bonz",
        "Avdi",
        "DYB",
        "Tayota",
        "Sabaru",
        "Chervolet",
        "Ferraro",
        "Lamberghini",
        "Bandley",
      ],
    },
  },
} as const
