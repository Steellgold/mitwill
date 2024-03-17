import type { UserMetadata } from "@supabase/supabase-js";

export const fullName = (user: UserMetadata | undefined): string => {
  if (!user) return "Inconnu";
  return `${user.firstName} ${user.lastName}`;
};