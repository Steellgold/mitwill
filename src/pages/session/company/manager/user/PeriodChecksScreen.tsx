import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import type { RootStackParamList } from "../../../../../../App";
import { useAsync } from "../../../../../lib/hooks/useAsync";
import type { Database } from "../../../../../lib/db/supabase.types";
import { supabase } from "../../../../../lib/db/supabase";
import { dayJS } from "../../../../../lib/dayjs/day-js";
import { useSession } from "../../../../../lib/hooks/useSession";
import { WeeklyCheckCard } from "../../../../../lib/components/checks/WeeklyCheckCard";

type Props = NativeStackScreenProps<RootStackParamList, "PeriodChecksScreen">;

type Check = Database["public"]["Tables"]["checks"]["Row"];

export const PeriodChecksScreen = ({ route }: Props): ReactElement => {
  const [checks, setChecks] = useState<Check[]>([]);
  const { role } = useSession();

  useAsync(async(): Promise<void> => {
    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .gte("date", dayJS(route.params.start).format("YYYY-MM-DD"))
      .lte("date", dayJS(route.params.end).format("YYYY-MM-DD"))
      .order("date", { ascending: false });

    if (error) console.error("Error:", error);
    else setChecks(data);
  }, [route.params]);

  console.log("checks two", checks);

  return (
    <SafeAreaView style={{ padding: 15, gap: 10 }}>
      <View>
        <ScrollView>
          {/* eslint-disable-next-line max-len */}
          <Text variant="titleMedium">Pointage du {dayJS(route.params.start).format("ddd DD/MM")} au {dayJS(route.params.end).format("ddd DD/MM")} {dayJS(route.params.end).format("YYYY")}</Text>
          {role === "MANAGER" && <Text variant="bodyMedium">Liste des pointages de l'ensemble de vos employés</Text>}
          {role === "EMPLOYEE" && <Text variant="bodyMedium">Liste de vos pointages</Text>}
          <Divider style={{ marginVertical: 10 }} />

          {role === "EMPLOYEE" && (
            <WeeklyCheckCard startDate={route.params.start} endDate={route.params.end} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};