import { useState, type ReactElement } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, DataTable, Dialog, Divider, FAB, Portal, Text, TouchableRipple } from "react-native-paper";
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
import FastImage from "react-native-fast-image";
import { getAvatar } from "../../../lib/dicebear";
import { fixTime } from "../../../lib/time";

type Planning = Database["public"]["Tables"]["plannings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

type Props = NativeStackScreenProps<RootStackParamList, "PlanningScreen">;

export const PlanningsScreen = ({ navigation }: Props): ReactElement => {
  const { session, role } = useSession();
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [users, setUsers] = useState<{ planningId: string; users: User[] }[]>([]);

  const [loading, setLoading] = useState(true);

  useAsync(async() => {
    setLoading(true);

    if (session) {
      const { data: planningsData, error: planningsError } = await supabase.from("plannings").select("*");

      if (planningsError) {
        console.error("Error fetching plannings", planningsError);
        setLoading(false);
        return;
      }

      if (!planningsData) {
        console.error("No data returned from plannings");
        setLoading(false);
        return;
      }

      setPlannings(planningsData);

      const usersPromises = planningsData.map(async(planning) => {
        const users = await Promise.all(
          planning.for.map(async(userId) => {
            const { data: userData, error: userError } = await supabase
              .from("users_view")
              .select("*")
              .eq("userId", userId)
              .single();

            if (userError) {
              console.error("Error fetching user", userError);
              return;
            }

            return userData;
          })
        );

        return { planningId: planning.uuid, users: users.filter(Boolean) };
      });

      const usersData = await Promise.all(usersPromises);
      setUsers(usersData as { planningId: string; users: User[] }[]);
    }

    setLoading(false);
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

  const fromTo = (from: string, to: string): string => {
    return `Du ${dayJS(from).format("dddd D MMMM")} au ${dayJS(to).format("dddd D MMMM")}`;
  };

  const today = dayJS();

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 15 }}>
          {plannings.map((planning) => (
            <Card>
              <TouchableRipple onPress={() => navigation.navigate("PlanningScreen", { date: planning.from })} borderless style={{ borderRadius: 10 }}>
                <>
                  <Card.Title
                    title={"Planning"}
                    subtitle={fromTo(planning.from, planning.to)}
                    subtitleStyle={{ marginTop: -10 }}
                  />

                  <Card.Content style={{ marginBottom: 15 }}>
                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title>Jour</DataTable.Title>
                        <DataTable.Title numeric>Heure de début</DataTable.Title>
                        <DataTable.Title numeric>Heure de fin</DataTable.Title>
                      </DataTable.Header>

                      {planning.hours_type == "FOR_ALL" ? (
                        <>
                          {[1, 2, 3, 4, 5].map((day) => (
                            <DataTable.Row key={day} style={{
                              backgroundColor: dayJS(planning.from).add(day - 1, "day").isSame(today, "day") ? "#fffbfe" : "transparent"
                            }}>
                              <DataTable.Cell>{dayJS(planning.from).add(day - 1, "day").format("ddd DD/MM")}</DataTable.Cell>
                              <DataTable.Cell numeric>
                                <Chip icon={"clock-start"}>
                                  {fixTime(planning.allStart)}
                                </Chip>
                              </DataTable.Cell>

                              <DataTable.Cell numeric>
                                <Chip icon={"clock-end"}>
                                  {fixTime(planning.allEnd)}
                                </Chip>
                              </DataTable.Cell>
                            </DataTable.Row>
                          ))}
                        </>
                      ) : (
                        <Text variant="bodyMedium" style={{ textAlign: "center", marginTop: 10 }}>
                          Encore en développement
                        </Text>
                      )}
                    </DataTable>

                    <Divider style={{ marginBottom: 10 }} />

                    <Text variant="bodyMedium">Employés associés à ce planning:</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                      {users.find((user) => user.planningId === planning.uuid)?.users.map((user) => (
                        <Chip key={user.userId} style={{ marginRight: 5, marginBottom: 5 }} avatar={
                          <FastImage
                            source={{ uri: user.avatar || getAvatar(user.firstName || "", user.lastName || "") }}
                            style={{ width: 24, height: 24, borderRadius: 12 }}
                          />
                        } mode="outlined">
                          {user.firstName}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </>
              </TouchableRipple>
            </Card>
          ))}
          <PlanningFAB />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  if (role === "MANAGER") actions.push({ icon: "calendar-plus", label: "Ajouter un planning", onPress: () => setAddDialogOpen(true) });

  return (
    <Portal>
      <Dialog visible={addDialogOpen} onDismiss={() => setAddDialogOpen(false)}>
        <Dialog.Icon icon="calendar-plus" />
        <Dialog.Title style={{ textAlign: "center" }}>Choisissez une semaine</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 60 }}>
            Choisissez la semaine à ajouter, vous pourrez ensuite ajouter les horraires de travail pour chaque jour
          </Text>

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

      {role === "MANAGER" &&      <FAB.Group
        open={open}
        visible={isFocused}
        style={{ position: "absolute", bottom: 0, right: 0 }}
        icon={"calendar"}
        actions={actions}
        onStateChange={({ open }) => setOpen(open)}
        onPress={() => setOpen(!open)}
      />}
    </Portal>
  );
};