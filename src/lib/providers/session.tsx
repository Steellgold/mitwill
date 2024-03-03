import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../db/supabase";

export type SessionContextType = {
  logout: () => Promise<void>;
  session: Session | false;
};

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [session, setSession] = useState<Session | false>(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Session event", event, session);
      setSession(session || false);
    });

    return (): void => {
      console.log("Session event cleanup");
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async(): Promise<void> => {
    await supabase.auth.signOut();
  };

  return (
    <SessionContext.Provider value={{
      logout,
      session
    }}>
      {children}
    </SessionContext.Provider>
  );
};