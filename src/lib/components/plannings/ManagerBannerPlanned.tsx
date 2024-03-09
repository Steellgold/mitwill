/* eslint-disable camelcase */
import type { ReactElement } from "react";
import { useState } from "react";
import { useSession } from "../../hooks/useSession";
import { dayJS } from "../../dayjs/day-js";
import { useAsync } from "../../hooks/useAsync";
import { supabase } from "../../db/supabase";
import { Banner } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export const PlanningBannerNotPlanned = (): ReactElement => {
  const { session, role } = useSession();
  const [nextWeekPlanned, setNextWeekPlanned] = useState<boolean>(false);
  const { navigate } = useNavigation();

  const YYYYMMDD = dayJS()
    .add(1, "week")
    .startOf("week")
    .format("YYYY-MM-DD");

  useAsync(async() => {
    if (role == "MANAGER" && session) {
      const { data, error } = await supabase.rpc("is_planning_planned", { date: YYYYMMDD });
      if (error) return console.error("aaaaaaaaa", error);
      if (data == true || data == false) setNextWeekPlanned(data);
    }
  }
  , []);

  if (role !== "MANAGER") return <></>;
  if (!session) return <></>;
  if (nextWeekPlanned) return <></>;

  return (
    <Banner
      visible={!nextWeekPlanned}
      actions={[
        // @ts-ignore
        { label: "Planifier", onPress: () => navigate("AddPlanningScreen", { date: YYYYMMDD }) }
      ]}
    >
      La semaine du {dayJS(YYYYMMDD).format("DD/MM")} n'est pas encore planifiée, planifiez-la dès maintenant pour éviter les oublis.
    </Banner>
  );
};