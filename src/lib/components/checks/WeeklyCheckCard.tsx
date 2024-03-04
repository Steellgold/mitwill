import { useState, type ReactElement, useEffect } from "react";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import { useAsync } from "../../hooks/useAsync";
import { supabase } from "../../db/supabase";
import { dayJS } from "../../dayjs/day-js";
import type { Database } from "../../db/supabase.types";
import { ActivityIndicator, Card, DataTable, Icon, IconButton, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export const WeeklyCheckCard = (): ReactElement => {
  const { session } = useSession();
  if (!session) return <NoCheckCard type="weekly" />;
  const { navigate } = useNavigation();

  const [startWeek, setStartWeek] = useState<string>(dayJS().startOf("week").format("YYYY-MM-DD"));
  const [endWeek, setEndWeek] = useState<string>(dayJS().endOf("week").format("YYYY-MM-DD"));
  const [checks, setChecks] = useState<Database["public"]["Tables"]["checks"]["Row"][] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setStartWeek(dayJS().startOf("week").format("YYYY-MM-DD"));
    setEndWeek(dayJS().endOf("week").format("YYYY-MM-DD"));
    setLoading(false);
    setChecks([]);
  }, []);

  useAsync(async() => {
    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", session.user.id)
      .gte("date", startWeek)
      .lte("date", endWeek)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error:WCC", error.message);
    } else {
      setChecks(data || []);
    }
  }, [session]);

  const handleSwitchWeek = async(action: "previous" | "next" | "reset"): Promise<void> => {
    setLoading(true);
    if (action === "previous") {
      setStartWeek(dayJS(startWeek).add(-7, "d").format("YYYY-MM-DD"));
      setEndWeek(dayJS(endWeek).add(-7, "d").format("YYYY-MM-DD"));
    } else if (action === "next") {
      setStartWeek(dayJS(startWeek).add(7, "d").format("YYYY-MM-DD"));
      setEndWeek(dayJS(endWeek).add(7, "d").format("YYYY-MM-DD"));
    } else {
      setStartWeek(dayJS().startOf("week").format("YYYY-MM-DD"));
      setEndWeek(dayJS().endOf("week").format("YYYY-MM-DD"));
    }

    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", session.user.id)
      .gte("date", startWeek)
      .lte("date", endWeek)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error:WCC", error.message);
    } else {
      setTimeout(() => setLoading(false), 200);
      setChecks(data || []);
    }
  };

  return (
    <Card>
      <Card.Title
        title={`Semaine du ${dayJS(startWeek).startOf("week").format("DD MMMM")} au ${dayJS(endWeek).endOf("week").add(-2, "d").format("DD MMMM")}`}
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
              <DataTable.Cell numeric>{dayJS(check.end).format("HH[h ]mm[m]")}</DataTable.Cell>
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