import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Dialog, FAB, Portal, Text } from "react-native-paper";
import { useSession } from "../../../lib/hooks/useSession";
import type { Database } from "../../../lib/db/supabase.types";
import { useAsync } from "../../../lib/hooks/useAsync";
import { supabase } from "../../../lib/db/supabase";
import { dayJS } from "../../../lib/dayjs/day-js";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { FABGroupActions } from "../../../lib/types/fab";
import { DatePickerInput } from "react-native-paper-dates";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../../App";

type Planning = Database["public"]["Tables"]["plannings"]["Row"];
type Props = NativeStackScreenProps<RootStackParamList, "PlanningScreen">;

export const PlanningsScreen = ({ navigation }: Props): ReactElement => {
  const { session, role } = useSession();
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);

  useAsync(async() => {
    setLoading(true);

    if (session) {
      const { data, error } = await supabase
        .from("plannings")
        .select("*")
        .contains("for", [session.user.id]);
      if (error) return console.error("Error fetching plannings", error);
      console.log("Plannings", data);
      setPlannings(data || []);
      setLoading(false);
    }
  }, []);

  if (plannings.length === 0) {
    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ marginBottom: 20, textAlign: "center", marginLeft: 20, marginRight: 20 }}>
          Aucun planning n'a été ajouté jusqu'à présent</Text>
        {role === "MANAGER" && <PlanningFAB />}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating={true} color="#fd7e46" size="large" />
        <Text style={{ marginTop: 20 }}>Chargement des plannings...</Text>
      </View>
    );
  }

  return (
    <View>
      {plannings.map((planning) => (
        <Text key={planning.uuid} onPress={
          () => navigation.navigate("CUPlanningScreen", { date: planning.from, planningId: planning.uuid })
        } style={{ margin: 20 }}>
          {planning.from}</Text>
      ))}
      <PlanningFAB />
    </View>
  );
};

const PlanningFAB = (): ReactElement => {
  const { session, role } = useSession();
  const isFocused = useIsFocused();
  const [open, setOpen] = useState(false);
  const { navigate } = useNavigation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDate, setAddDate] = useState(dayJS().startOf("week").toDate());

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDate, setSearchDate] = useState(dayJS().startOf("week").toDate());

  if (!session || !isFocused) return <></>;

  const actions: FABGroupActions[] = [];
  // @ts-ignore
  if (role === "MANAGER") actions.push({ icon: "calendar-plus", label: "Ajouter un planning", onPress: () => setAddDialogOpen(true) });
  actions.push({ icon: "calendar-search", label: "Consulter un planning spécifique", onPress: () => setSearchDialogOpen(true) });

  return (
    <Portal>
      <Dialog visible={addDialogOpen} onDismiss={() => setAddDialogOpen(false)}>
        <Dialog.Icon icon="calendar-plus" />
        <Dialog.Title style={{ textAlign: "center" }}>Choisissez une semaine</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 60 }}
          >Choisissez la semaine à ajouter, vous pourrez ensuite ajouter les horraires de travail pour chaque jour</Text>

          <DatePickerInput
            locale="fr"
            inputMode="start"
            label={"Date de début"}
            value={addDate}
            mode="outlined"
            style={{ marginBottom: 40 }}
            onChange={(date) => setAddDate(date as Date)}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => setAddDialogOpen(false)}>Annuler</Button>
          <Button onPress={() => {
            setAddDialogOpen(false);
            // @ts-ignore
            navigate("CUPlanningScreen", { date: addDate });
          }}>Continuer</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={searchDialogOpen} onDismiss={() => setSearchDialogOpen(false)}>
        <Dialog.Icon icon="calendar-search" />
        <Dialog.Title style={{ textAlign: "center" }}>Choisissez une semaine</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 60 }}>
            Choisissez la semaine à consulter, vous pourrez consulter les horraires de travail pour chaque jour et les employés associés
          </Text>

          <DatePickerInput
            locale="fr"
            inputMode="start"
            label={"Date de début"}
            value={searchDate}
            mode="outlined"
            style={{ marginBottom: 40 }}
            onChange={(date) => setSearchDate(date as Date)}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => setSearchDialogOpen(false)}>Annuler</Button>
          <Button onPress={() => {
            setSearchDialogOpen(false);
            // @ts-ignore
            navigate("PlanningScreen", { date: dayJS(searchDate).startOf("week").format("YYYY-MM-DD") });
          }}>Continuer</Button>
        </Dialog.Actions>
      </Dialog>

      <FAB.Group
        open={open}
        visible={isFocused}
        style={{ position: "absolute", bottom: 0, right: 0 }}
        icon={"calendar"}
        actions={actions}
        onStateChange={({ open }) => setOpen(open)}
        onPress={() => setOpen(!open)}
      />
    </Portal>
  );
};