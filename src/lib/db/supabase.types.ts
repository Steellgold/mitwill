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
          pauseTaken: boolean;
          start: string;
          userId: string;
          uuid: string;
        };
        Insert: {
          date: string;
          end?: string | null;
          pauseTaken?: boolean;
          start?: string;
          userId: string;
          uuid?: string;
        };
        Update: {
          date?: string;
          end?: string | null;
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
      users: {
        Row: {
          active: string | null;
          approvedAt: string | null;
          createdAt: string;
          declinedAt: string | null;
          declinedFor: string | null;
          email: string;
          firstName: string | null;
          lastName: string | null;
          role: Database["public"]["Enums"]["Role"];
          status: Database["public"]["Enums"]["Status"];
          updatedAt: string;
          userId: string;
        };
        Insert: {
          active?: string | null;
          approvedAt?: string | null;
          createdAt?: string;
          declinedAt?: string | null;
          declinedFor?: string | null;
          email: string;
          firstName?: string | null;
          lastName?: string | null;
          role?: Database["public"]["Enums"]["Role"];
          status?: Database["public"]["Enums"]["Status"];
          updatedAt?: string;
          userId: string;
        };
        Update: {
          active?: string | null;
          approvedAt?: string | null;
          createdAt?: string;
          declinedAt?: string | null;
          declinedFor?: string | null;
          email?: string;
          firstName?: string | null;
          lastName?: string | null;
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
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      approve_user: {
        Args: {
          user_id: string;
        };
        Returns: undefined;
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
        Returns: undefined;
      };
      is_manager: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      Role: "EMPLOYEE" | "MANAGER";
      Status: "APPROVED" | "DECLINED" | "WAITING";
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