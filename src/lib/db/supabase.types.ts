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
      checks: {
        Row: {
          date: string;
          end: string | null;
          need_validation: boolean;
          pauseTaken: boolean;
          start: string;
          userId: string;
          uuid: string;
        };
        Insert: {
          date: string;
          end?: string | null;
          need_validation?: boolean;
          pauseTaken?: boolean;
          start?: string;
          userId: string;
          uuid?: string;
        };
        Update: {
          date?: string;
          end?: string | null;
          need_validation?: boolean;
          pauseTaken?: boolean;
          start?: string;
          userId?: string;
          uuid?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_checks_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      plannings: {
        Row: {
          allEnd: string | null;
          allStart: string | null;
          by: string;
          can_start_sunday: boolean;
          created_at: string;
          for: string[];
          friday_end: string | null;
          friday_start: string | null;
          from: string;
          hours_type: Database["public"]["Enums"]["HoursType"];
          monday_end: string | null;
          monday_start: string | null;
          saturday_enabled: boolean;
          saturday_end: string | null;
          saturday_start: string | null;
          sunday_end: string | null;
          sunday_start: string | null;
          thursday_end: string | null;
          thursday_start: string | null;
          to: string;
          tuesday_end: string | null;
          tuesday_start: string | null;
          uuid: string;
          wednesday_end: string | null;
          wednesday_start: string | null;
          week_type: Database["public"]["Enums"]["WeekType"];
        };
        Insert: {
          allEnd?: string | null;
          allStart?: string | null;
          by: string;
          can_start_sunday?: boolean;
          created_at?: string;
          for: string[];
          friday_end?: string | null;
          friday_start?: string | null;
          from: string;
          hours_type?: Database["public"]["Enums"]["HoursType"];
          monday_end?: string | null;
          monday_start?: string | null;
          saturday_enabled?: boolean;
          saturday_end?: string | null;
          saturday_start?: string | null;
          sunday_end?: string | null;
          sunday_start?: string | null;
          thursday_end?: string | null;
          thursday_start?: string | null;
          to: string;
          tuesday_end?: string | null;
          tuesday_start?: string | null;
          uuid?: string;
          wednesday_end?: string | null;
          wednesday_start?: string | null;
          week_type?: Database["public"]["Enums"]["WeekType"];
        };
        Update: {
          allEnd?: string | null;
          allStart?: string | null;
          by?: string;
          can_start_sunday?: boolean;
          created_at?: string;
          for?: string[];
          friday_end?: string | null;
          friday_start?: string | null;
          from?: string;
          hours_type?: Database["public"]["Enums"]["HoursType"];
          monday_end?: string | null;
          monday_start?: string | null;
          saturday_enabled?: boolean;
          saturday_end?: string | null;
          saturday_start?: string | null;
          sunday_end?: string | null;
          sunday_start?: string | null;
          thursday_end?: string | null;
          thursday_start?: string | null;
          to?: string;
          tuesday_end?: string | null;
          tuesday_start?: string | null;
          uuid?: string;
          wednesday_end?: string | null;
          wednesday_start?: string | null;
          week_type?: Database["public"]["Enums"]["WeekType"];
        };
        Relationships: [
          {
            foreignKeyName: "public_plannings_by_fkey";
            columns: ["by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["userId"];
          },
          {
            foreignKeyName: "public_plannings_by_fkey";
            columns: ["by"];
            isOneToOne: false;
            referencedRelation: "users_view";
            referencedColumns: ["userId"];
          }
        ];
      };
      users: {
        Row: {
          active: string | null;
          approvedAt: string | null;
          avatar: string | null;
          createdAt: string;
          declinedAt: string | null;
          declinedFor: string | null;
          email: string;
          fcm_token: string | null;
          firstName: string | null;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string | null;
          notify_approbations: boolean;
          role: Database["public"]["Enums"]["Role"];
          status: Database["public"]["Enums"]["Status"];
          updatedAt: string;
          userId: string;
        };
        Insert: {
          active?: string | null;
          approvedAt?: string | null;
          avatar?: string | null;
          createdAt?: string;
          declinedAt?: string | null;
          declinedFor?: string | null;
          email: string;
          fcm_token?: string | null;
          firstName?: string | null;
          ignore?: boolean;
          is_meti?: boolean | null;
          lastName?: string | null;
          notify_approbations?: boolean;
          role?: Database["public"]["Enums"]["Role"];
          status?: Database["public"]["Enums"]["Status"];
          updatedAt?: string;
          userId: string;
        };
        Update: {
          active?: string | null;
          approvedAt?: string | null;
          avatar?: string | null;
          createdAt?: string;
          declinedAt?: string | null;
          declinedFor?: string | null;
          email?: string;
          fcm_token?: string | null;
          firstName?: string | null;
          ignore?: boolean;
          is_meti?: boolean | null;
          lastName?: string | null;
          notify_approbations?: boolean;
          role?: Database["public"]["Enums"]["Role"];
          status?: Database["public"]["Enums"]["Status"];
          updatedAt?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_users_active_fkey";
            columns: ["active"];
            isOneToOne: false;
            referencedRelation: "checks";
            referencedColumns: ["uuid"];
          },
          {
            foreignKeyName: "public_users_userId_fkey";
            columns: ["userId"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      versions: {
        Row: {
          changelog: string | null;
          version_code: string | null;
          version_uuid: string;
        };
        Insert: {
          changelog?: string | null;
          version_code?: string | null;
          version_uuid?: string;
        };
        Update: {
          changelog?: string | null;
          version_code?: string | null;
          version_uuid?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      users_view: {
        Row: {
          avatar: string | null;
          firstName: string | null;
          lastName: string | null;
          userId: string | null;
        };
        Insert: {
          avatar?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          userId?: string | null;
        };
        Update: {
          avatar?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_users_userId_fkey";
            columns: ["userId"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      approve_user: {
        Args: {
          user_id: string;
        };
        Returns: {
          active: string | null;
          approvedAt: string | null;
          avatar: string | null;
          createdAt: string;
          declinedAt: string | null;
          declinedFor: string | null;
          email: string;
          fcm_token: string | null;
          firstName: string | null;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string | null;
          notify_approbations: boolean;
          role: Database["public"]["Enums"]["Role"];
          status: Database["public"]["Enums"]["Status"];
          updatedAt: string;
          userId: string;
        };
      };
      count_users_waiting: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      decline_user: {
        Args: {
          user_id: string;
          reason: string;
        };
        Returns: {
          active: string | null;
          approvedAt: string | null;
          avatar: string | null;
          createdAt: string;
          declinedAt: string | null;
          declinedFor: string | null;
          email: string;
          fcm_token: string | null;
          firstName: string | null;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string | null;
          notify_approbations: boolean;
          role: Database["public"]["Enums"]["Role"];
          status: Database["public"]["Enums"]["Status"];
          updatedAt: string;
          userId: string;
        };
      };
      get_approbator: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_latest_version: {
        Args: {
          given_version_code: string;
        };
        Returns: {
          version_uuid: string;
          version_code: string;
          changelog: string;
        }[];
      };
      get_user: {
        Args: {
          uuid: string;
        };
        Returns: {
          firstname: string;
          lastname: string;
        }[];
      };
      is_manager: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      is_planning_planned: {
        Args: {
          date: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      HoursType: "FOR_ALL" | "CUSTOM";
      Role: "EMPLOYEE" | "MANAGER";
      Status: "APPROVED" | "DECLINED" | "WAITING";
      WeekType: "NIGHT" | "NORMAL";
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never