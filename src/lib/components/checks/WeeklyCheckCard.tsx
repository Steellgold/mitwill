import { useState, type ReactElement } from "react";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import { useAsync } from "../../hooks/useAsync";
import { supabase } from "../../db/supabase";
import { dayJS } from "../../dayjs/day-js";
import type { Database } from "../../db/supabase.types";
import { Card, DataTable, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export const WeeklyCheckCard = (): ReactElement => {
  const { session } = useSession();
  if (!session) return <NoCheckCard type="weekly" />;
  const { navigate } = useNavigation();

  const startWeek = dayJS().startOf("week").format("YYYY-MM-DD");
  const endWeek = dayJS().endOf("week").format("YYYY-MM-DD");

  const [checks, setChecks] = useState<Database["public"]["Tables"]["checks"]["Row"][] | []>([]);

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

  return (
    <Card>
      <Card.Title
        title={`Semaine du ${dayJS().startOf("week").format("DD MMMM")} au ${dayJS().endOf("week").format("DD MMMM")}`}
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

        {checks.length === 0 ? (
          <DataTable.Row>
            <DataTable.Cell>Aucun pointage cette semaine pour le moment</DataTable.Cell>
          </DataTable.Row>
        ) : checks.map((check) => (
          // @ts-ignore
          <TouchableRipple borderless onPress={(): void => navigate("CheckInfoScreen", { check })} key={check.uuid}>
            <DataTable.Row>
              <DataTable.Cell>{dayJS(check.date).format("ddd DD/MM")}</DataTable.Cell>
              <DataTable.Cell numeric>{dayJS(check.start).format("HH[h ]mm[m]")}</DataTable.Cell>
              <DataTable.Cell numeric>{dayJS(check.end).format("HH[h ]mm[m]")}</DataTable.Cell>
            </DataTable.Row>
          </TouchableRipple>
        ))}
      </DataTable>
    </Card>
  );
};