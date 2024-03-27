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
          pause: Database["public"]["Enums"]["PauseType"] | null;
          pauseTaken: boolean;
          start: string;
          userId: string;
          uuid: string;
        };
        Insert: {
          date: string;
          end?: string | null;
          need_validation?: boolean;
          pause?: Database["public"]["Enums"]["PauseType"] | null;
          pauseTaken?: boolean;
          start?: string;
          userId: string;
          uuid?: string;
        };
        Update: {
          date?: string;
          end?: string | null;
          need_validation?: boolean;
          pause?: Database["public"]["Enums"]["PauseType"] | null;
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
          },
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
          firstName: string;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string;
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
          firstName: string;
          ignore?: boolean;
          is_meti?: boolean | null;
          lastName: string;
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
          firstName?: string;
          ignore?: boolean;
          is_meti?: boolean | null;
          lastName?: string;
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
          },
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
          },
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
          firstName: string;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string;
          notify_approbations: boolean;
          role: Database["public"]["Enums"]["Role"];
          status: Database["public"]["Enums"]["Status"];
          updatedAt: string;
          userId: string;
        };
      };
      count_pending_checks: {
        Args: Record<PropertyKey, never>;
        Returns: number;
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
          firstName: string;
          ignore: boolean;
          is_meti: boolean | null;
          lastName: string;
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
      latest_version: {
        Args: {
          given_version_code: string;
        };
        Returns: {
          version_uuid: string;
          version_code: string;
          changelog: string;
        }[];
      };
    };
    Enums: {
      HoursType: "FOR_ALL" | "CUSTOM";
      PauseType: "NONE" | "DEFAULT" | "LONG";
      Role: "EMPLOYEE" | "MANAGER";
      Status: "APPROVED" | "DECLINED" | "WAITING";
      WeekType: "NIGHT" | "NORMAL";
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never