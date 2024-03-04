import { useState, type ReactElement, useEffect } from "react";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import { useAsync } from "../../hooks/useAsync";
import { supabase } from "../../db/supabase";
import { dayJS } from "../../dayjs/day-js";
import { ActivityIndicator, Card, DataTable, Icon, IconButton, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { Check } from "../../providers/session";

export const WeeklyCheckCard = (): ReactElement => {
  const { session } = useSession();
  if (!session) return <NoCheckCard type="weekly" />;
  const { navigate } = useNavigation();

  const [week, setWeek] = useState<string>(dayJS().format("YYYY-MM-DD"));
  const [checks, setChecks] = useState<Check[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChecks = async(weekToFetch: string): Promise<void> => {
    setLoading(true);

    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", session.user.id)
      .gte("date", dayJS(weekToFetch).startOf("week").format("YYYY-MM-DD"))
      .lte("date", dayJS(weekToFetch).endOf("week").format("YYYY-MM-DD"))
      .order("date", { ascending: false });

    if (error) {
      console.error("Error:WCC", error.message);
    } else {
      setChecks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChecks(week)
      .then(() => console.log(`Checks fetched for the week of ${week}`))
      .catch((error) => console.error("Error (WeeklyCheckCard.tsx l43):", error));
  }, [week]);

  useAsync(async() => {
    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", session.user.id)
      .gte("date", dayJS(week).startOf("week").format("YYYY-MM-DD"))
      .lte("date", dayJS(week).endOf("week").format("YYYY-MM-DD"))
      .order("date", { ascending: true });

    if (error) {
      console.error("Error:WCC", error.message);
    } else {
      setChecks(data || []);
    }
  }, [session]);

  const handleSwitchWeek = (action: "previous" | "next" | "reset"): void => {
    let newWeek;
    if (action === "previous") {
      newWeek = dayJS(week).add(-1, "week").format("YYYY-MM-DD");
    } else if (action === "next") {
      newWeek = dayJS(week).add(1, "week").format("YYYY-MM-DD");
    } else {
      newWeek = dayJS().format("YYYY-MM-DD");
    }

    setWeek(newWeek);
  };

  return (
    <Card>
      <Card.Title
        title={`Semaine du ${dayJS(week).startOf("week").format("DD MMMM")} au ${dayJS(week).endOf("week").add(-2, "d").format("DD MMMM")}`}
        subtitle="Liste des pointages de la semaine"
        subtitleVariant="bodySmall"
        subtitleStyle={{ marginTop: -5 }}
      />

      <DataTable style={{ padding: 4 }}>
        <DataTable.Header>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Début</DataTable.Title>
          <DataTable.Title numeric>Sortie</DataTable.Title>
        </DataTable.Header>

        {loading ? (
          <DataTable.Row style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator animating color="#fd7e46" size="large"/>
          </DataTable.Row>
        ) : checks.length === 0 ? (
          <DataTable.Row>
            <DataTable.Cell>Aucun pointage cette semaine pour le moment</DataTable.Cell>
          </DataTable.Row>
        ) : checks.map((check) => (
          // @ts-ignore
          <TouchableRipple borderless onPress={(): void => navigate("CheckInfoScreen", check)} key={check.uuid}>
            <DataTable.Row>
              <DataTable.Cell>{dayJS(check.date).format("ddd DD/MM")}</DataTable.Cell>
              <DataTable.Cell numeric>{dayJS(check.start).format("HH[h ]mm[m]")}</DataTable.Cell>
              {check.end
                ? <DataTable.Cell numeric>{dayJS(check.end).format("HH[h ]mm[m]")}</DataTable.Cell>
                : <DataTable.Cell numeric>En cours</DataTable.Cell>
              }
            </DataTable.Row>
          </TouchableRipple>
        ))}
      </DataTable>

      <Card.Actions>
        <IconButton mode="contained-tonal" onPress={() => void handleSwitchWeek("previous")} icon={() => <Icon size={16} source={"arrow-left"}/>} />
        <IconButton mode="contained-tonal" onPress={() => void handleSwitchWeek("reset")} icon={() => <Icon size={16} source={"calendar-today"}/>} />
        <IconButton mode="contained-tonal" onPress={() => void handleSwitchWeek("next")} icon={() => <Icon size={16} source={"arrow-right"}/>} />
      </Card.Actions>
    </Card>
  );
};