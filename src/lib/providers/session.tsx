import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../db/supabase";

export type SessionContextType = {
  logout: () => Promise<void>;
  session: Session | null;
  hasSession: boolean;

  logoutLoading?: boolean;
};

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [session, setSession] = useState<Session | null>(null);
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session || null);
    });

    return (): void => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async(): Promise<void> => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    setLogoutLoading(false);
  };

  return (
    <SessionContext.Provider value={{
      logout,
      session,
      hasSession: session !== null,
      logoutLoading
    }}>
      {children}
    </SessionContext.Provider>
  );
};