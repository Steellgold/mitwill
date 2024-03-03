import { useState, type ReactElement, useEffect } from "react";
import { Card } from "react-native-paper";
import type { Database } from "../../db/supabase.types";
import { majdate } from "../../dayjs/day-js.utils";
import { dayJS } from "../../dayjs/day-js";
import { supabase } from "../../db/supabase";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";

export const CheckCard = (): ReactElement => {
  const { session } = useSession();
  if (!session) return <NoCheckCard type="session" />;

  const [checkToday, setCheckToday] = useState<Database["public"]["Tables"]["checks"]["Row"] | undefined>(undefined);

  useEffect(() => {
    const fetchChecks = async(): Promise<void> => {
      const { data, error } = await supabase.from("checks").select("*").eq("userId", session?.user.id || "").eq("date", dayJS().format("YYYY-MM-DD"));
      if (error) console.error("Error:A", error.message);
      else setCheckToday(data.find((check) => dayJS(check.start).dayOfYear() === dayJS().dayOfYear()));
    };

    if (session) fetchChecks()
      .then(() => console.log("Check fetched"))
      .catch(() => console.error("Error, checks not fetched (HomeScreen.tsx)"));
  }, [session]);

  if (!checkToday) return <NoCheckCard type="daily" />;

  return (
    <Card>
      <Card.Title
        title={majdate(checkToday?.date || dayJS().toDate())}
        subtitle={`Vous avez commencé à travailler à ${dayJS(checkToday?.start).format("HH:mm")}`}
        subtitleStyle={{ marginTop: -5 }}
      />
    </Card>
  );
};