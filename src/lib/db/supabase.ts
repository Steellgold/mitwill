
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import { AppState } from "react-native";

const SUPABASE_URL = "https://xjgmgvvxdtpgkymqpvnz.supabase.co";
// eslint-disable-next-line max-len
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZ21ndnZ4ZHRwZ2t5bXFwdm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzOTcwNzEsImV4cCI6MjAyNDk3MzA3MX0.Y_hYQ8S-AXyD3MW3pouna6Df5vz9hTKd7u75lxUCcHs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh()
      .then(() => console.log("Auto refresh started"))
      .catch((error) => console.error("Error (supabase.ts l25):", error));
  } else {
    supabase.auth.stopAutoRefresh()
      .then(() => console.log("Auto refresh stopped"))
      .catch((error) => console.error("Error (supabase.ts l29):", error));
  }
});