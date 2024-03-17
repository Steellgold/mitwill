/* eslint-disable camelcase */
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../db/supabase";
import type { Database } from "../db/supabase.types";
import { dayJS } from "../dayjs/day-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Check = Database["public"]["Tables"]["checks"]["Row"];

export type SessionContextType = {
  logout: () => Promise<void>;
  session: Session | null;
  hasSession: boolean;

  logoutLoading?: boolean;

  activeCheck: Check | null;
  setPauseTaken: (value: boolean) => Promise<void>;
  checks: Check[] | [];

  startCheck: () => Promise<void>;
  endCheck: (
    needValidation?: boolean,
    start?: string,
    end?: string
  ) => Promise<void>;

  reloadChecks?: () => Promise<void>;

  needDataRefresh?: boolean;
  setNeedDataRefresh?: (value: boolean) => void;
  appLoading?: boolean;

  role: Database["public"]["Enums"]["Role"];
  status: Database["public"]["Enums"]["Status"];
  isMeti: boolean;

  avatar: string | null;
  setAvatar: (value: string) => void;

  uuid?: string;

  refreshing?: boolean;
  refresh?: () => void;
};

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [session, setSession] = useState<Session | null>(null);
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false);

  const [activeCheck, setActiveCheck] = useState<Check | null>(null);
  const [checks, setChecks] = useState<Check[] | []>([]);

  const [needDataRefresh, setNeedDataRefresh] = useState<boolean>(false);
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string | undefined>();
  const [avatar, setAvatar] = useState<string | null>(null);

  const [status, setStatus] = useState<Database["public"]["Enums"]["Status"]>("WAITING");
  const [role, setRole] = useState<Database["public"]["Enums"]["Role"]>("EMPLOYEE");
  const [isMeti, setIsMeti] = useState<boolean>(false);

  const fetchChecks = async(): Promise<void> => {
    if (!session) return console.log("No session");
    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", session?.user.id || "")
      .order("date", { ascending: false });

    if (error) console.error("Error:", error);
    if (data) {
      const activeCheck = data.find((check) => !check.end);
      if (activeCheck) setActiveCheck(activeCheck);
      setChecks(data);
    }
  };

  const fetchUser = async(): Promise<void> => {
    if (!session) return console.log("No session");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userId", session?.user.id || "");

    const dbFcmToken = await supabase.from("users").select("fcm_token").eq("userId", session?.user.id || "").single();
    const localFcmToken = await AsyncStorage.getItem("fcmToken");
    if (dbFcmToken.data?.fcm_token !== localFcmToken) {
      await supabase.from("users").update({ fcm_token: localFcmToken }).eq("userId", session?.user.id || "");
      console.debug("FCM token updated");
    }

    if (error) console.error("Error:", error);
    if (!data) return console.error("No data returned from fetchUser");

    setStatus(data[0].status);
    setRole(data[0].role);
    setUuid(data[0].userId);
    setAvatar(data[0].avatar);
    setIsMeti(data[0].is_meti || false);

    setAppLoading(false);
  };

  useEffect(() => {
    setTimeout(() => setAppLoading(false), 1000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session || null);

      if (session !== null) {
        fetchChecks()
          .then(() => console.log("Checks fetched"))
          .catch((error) => console.error("Error", error));

        fetchUser()
          .then(() => console.log("User fetched"))
          .catch((error) => console.error("Error", error));
      }
    });

    return (): void => subscription?.unsubscribe();
  }, [!session]);

  const logout = async(): Promise<void> => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    setLogoutLoading(false);
  };

  const startCheck = async(): Promise<void> => {
    const { data, error } = await supabase
      .from("checks")
      .insert({
        userId: session?.user.id || "",
        date: dayJS().format("YYYY-MM-DD"),
        start: dayJS().format("YYYY-MM-DD HH:mm:ss")
      })
      .select();

    if (error) console.error("Error:", error);
    if (data) {
      setActiveCheck(data[0]);
      setChecks((checks) => [data[0], ...checks]);
      setNeedDataRefresh(true);
    }
  };

  const endCheck = async(needValidation = false, start = "", end = ""): Promise<void> => {
    const { error } = await supabase
      .from("checks")
      .update({
        end: end !== "" ? end : dayJS().format("YYYY-MM-DD HH:mm:ss"),
        start: start !== "" ? start : activeCheck?.start,
        need_validation: needValidation
      })
      .eq("uuid", activeCheck?.uuid || "")
      .eq("userId", session?.user.id || "")
      .single();

    if (error) console.error("Error:", error);
    setActiveCheck(null);
    setChecks((checks) => checks.map((check) => check.uuid === activeCheck?.uuid ? { ...check, end: dayJS().toString() } : check));
    setNeedDataRefresh(true);
    await refresh();
  };

  const refresh = async(): Promise<void> => {
    setAppLoading(true);
    setRefreshing(true);
    setNeedDataRefresh(true);

    await fetchChecks();
    await fetchUser();

    setTimeout(() => setRefreshing(false), 1000);
  };

  const setPauseTaken = async(value: boolean): Promise<void> => {
    if (!session) return console.error("No session");
    if (!activeCheck) return console.error("No active check");
    const { error } = await supabase
      .from("checks")
      .update({ pauseTaken: value })
      .eq("uuid", activeCheck.uuid)
      .eq("userId", session?.user.id || "")
      .single();

    if (error) console.error("Error:", error);
    setNeedDataRefresh(true);
    setActiveCheck({ ...activeCheck, pauseTaken: value });
  };

  return (
    <SessionContext.Provider value={{
      async logout() {
        await logout();
      },
      session,
      hasSession: session !== null,
      logoutLoading,

      activeCheck,
      async setPauseTaken(value: boolean) {
        await setPauseTaken(value);
      },
      checks,

      startCheck,
      endCheck,

      appLoading,
      needDataRefresh,
      setNeedDataRefresh,

      role,
      status,
      isMeti,

      uuid,

      avatar,
      setAvatar(value: string) {
        setAvatar(value);
      },

      refreshing,
      async refresh() {
        await refresh();
      }
    }}>
      {children}
    </SessionContext.Provider>
  );
};