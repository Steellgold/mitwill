import { useContext } from "react";
import { SessionContext, type SessionContextType } from "../providers/session";

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};