/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, type ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { dayJS } from "../../../../lib/dayjs/day-js";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../../../App";
import { Header } from "./PlanningScreen.Header";
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, SegmentedButtons, Text, TouchableRipple } from "react-native-paper";
import { ChooseEmployeesDialog } from "./dialogs/ChooseEmployees";
import { ChooseTimeDialog } from "./dialogs/ChooseTime";
import { useAsync } from "../../../../lib/hooks/useAsync";
import { supabase } from "../../../../lib/db/supabase";
import type { Database } from "../../../../lib/db/supabase.types";
import { useSession } from "../../../../lib/hooks/useSession";
import { fixTime } from "../../../../lib/time";

type Props = NativeStackScreenProps<RootStackParamList, "CUPlanningScreen">;

export const CUPlanningScreen = ({ route, navigation }: Props): ReactElement => {
  const planningId = route.params?.planningId;

  const { session } = useSession();
  const week = dayJS(route.params?.date).startOf("week");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(planningId ? true : false);

  const [weekType, setWeekType] = useState<Database["public"]["Enums"]["WeekType"]>("NORMAL");
  const [hoursForAllDays, setHoursForAllDays] = useState<Database["public"]["Enums"]["HoursType"]>("FOR_ALL");

  const [employees, setEmployees] = useState<string[]>([]);
  const [employeesDialog, setEmployeesDialog] = useState(false);

  const [saturday, setSaturday] = useState<boolean>(false);

  const [sunday, setSunday] = useState<boolean>(false);

  const [allStart, setAllStart] = useState<string | null>(dayJS().format("HH:mm:[00]"));
  const [allEnd, setAllEnd] = useState<string | null>(dayJS().add(7, "hours").add(45, "minutes").format("HH:mm:[00]"));

  const [dialogAllVisible, setDialogAllVisible] = useState(false);

  useAsync(async() => {
    if (planningId) {
      setPageLoading(true);
      const { data, error } = await supabase.from("plannings").select("*").eq("uuid", planningId).single();
      if (error) return console.error("Error fetching planning", error);
      if (!data) return console.error("No planning found");

      setHoursForAllDays("FOR_ALL");
      setAllStart(data.allStart || null);
      setAllEnd(data.allEnd || null);
      setWeekType(data.week_type || "NORMAL");
      setEmployees(data.for);

      setPageLoading(false);
    }
  }, [planningId]);

  if (pageLoading) {
    return (
      <>
        <Header week={week} refetch={() => console.log("refetch")} employeesCount={0} />
        <View style={{ padding: 15, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating={true} color="#fd7e46" size="large" />
          <Text style={{ marginTop: 20 }}>Chargement du planning...</Text>
        </View>
      </>
    );
  }

  const handleSave = async(): Promise<void> => {
    if (planningId) return console.error("Editing planning is not yet supported");
    setLoading(true);

    const { status, error } = await supabase.from("plannings").insert(
      {
        by: session?.user?.id || "unknown",
        for: employees,
        from: week.format("YYYY-MM-DD"),
        to: week.add(4, "days").format("YYYY-MM-DD"),
        allStart,
        allEnd,
        can_start_sunday: sunday,
        week_type: weekType,
        hours_type: hoursForAllDays ? "FOR_ALL" : "CUSTOM"
      }
    );

    if (error) return console.error("Error saving planning", error);
    if (status === 201) {
      setLoading(false);
      navigation.navigate("PlanningScreen", { refresh: true });
    }
  };

  const toggleWeek = (): void => {
    setSaturday(false);
    setSunday(false);
    setWeekType("NORMAL");
  };

  const toggleNightWeek = (): void => {
    setSunday(false);
    setSaturday(false);
    setWeekType("NIGHT");
  };

  return (
    <SafeAreaProvider>
      <ScrollView>
        <Header week={week} refetch={() => console.log("refetch")} employeesCount={employees.length} />

        <View style={{ padding: 15, gap: 10 }}>
          <SegmentedButtons
            value={weekType}
            onValueChange={(value) => value === "NORMAL" ? toggleWeek() : toggleNightWeek()}
            buttons={[
              { label: "Semaine normale", value: "NORMAL", icon: "white-balance-sunny" },
              { label: "Semaine de nuit", value: "NIGHT", icon: "moon-waning-crescent" }
            ]}
          />

          <SegmentedButtons
            value={hoursForAllDays ? "FOR_ALL" : "CUSTOM"}
            onValueChange={(value) => setHoursForAllDays(value as Database["public"]["Enums"]["HoursType"])}
            buttons={[
              { label: "Mêmes horraires", value: "FOR_ALL", icon: hoursForAllDays ? "check" : "" },
              { label: "Horraires personnalisés", value: "CUSTOM", icon: hoursForAllDays ? "" : "check" }
            ]}
          />

          <ChooseEmployeesDialog
            visible={employeesDialog}
            defaultSelectedUsersIds={employees}
            hideDialog={() => setEmployeesDialog(false)}
            onDismiss={() => console.log("dismiss")}
            onConfirm={(users) => {
              setEmployees(users.map((u) => u.userId.toString()));
              setEmployeesDialog(false);
            }}
          />

          <Button mode="contained-tonal" icon="account-group" onPress={() => setEmployeesDialog(true)}>
            Choisir les employé(e)s concerné(e)s
          </Button>

          {weekType === "NIGHT"
            ? <Button mode="contained-tonal" icon="calendar-weekend" onPress={() => setSunday(!sunday)}>
              {!sunday ? "Commencer le dimanche" : "Plutôt commencer le lundi"}
            </Button>
            : <Button mode="contained-tonal" icon="calendar-week-begin" onPress={() => setSaturday(!saturday)}>{
              !saturday ? "Ajouter le samedi" : "Laissons le week-end tranquille"
            }</Button>
          }
          <Divider />
        </View>

        <View style={{ padding: 15, paddingTop: 0 }}>
          {hoursForAllDays ? (
            <Card>
              <ChooseTimeDialog
                visible={dialogAllVisible}
                hideDialog={() => setDialogAllVisible(false)}
                onDismiss={() => setDialogAllVisible(false)}
                onConfirm={(data) => {
                  setAllStart(data.start);
                  setAllEnd(data.end);
                  setDialogAllVisible(false);
                }}
                forAllDays
              />

              <TouchableRipple borderless onPress={() => setDialogAllVisible(true)} style={{ borderRadius: 10 }}>
                <>
                  <Card.Title title="Réglages des horraires (tous les jours)" />
                  <Card.Content style={{ marginBottom: 15 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text style={{ marginRight: "auto" }}>{sunday ? "Dim" : "Lun"} - {saturday ? "Sam." : "Ven."}</Text>

                      <Chip icon="clock" selected>{fixTime(allStart)}</Chip>
                      <Avatar.Icon icon="arrow-right" size={32} style={{ backgroundColor: "transparent" }} color="#474648" />
                      <Chip icon="clock" selected>{fixTime(allEnd)}</Chip>
                    </View>

                    {saturday && <Text style={{ marginTop: 15 }} variant="bodySmall">Le samedi est inclus</Text>}
                    {sunday && <Text style={{ marginTop: 15 }} variant="bodySmall">Le dimanche est inclus</Text>}
                    <Text style={{ marginTop: saturday || sunday ? 0 : 15 }} variant="bodySmall">
                      Pour modifier les horraires, appuyez sur la carte
                    </Text>
                  </Card.Content>
                </>
              </TouchableRipple>
            </Card>
          ) : (
            <Text variant="bodySmall">
              Encore en développement
            </Text>
          )}
        </View>


        <View style={{ padding: 15, paddingTop: 0 }}>
          <Divider style={{ marginBottom: 15 }} />

          <Button
            mode="contained"
            icon={!planningId ? "calendar-plus" : "calendar-edit"}
            loading={loading}
            disabled={
              loading
              || employees.length === 0
              || (hoursForAllDays ? !allStart || !allEnd : false)
              || !hoursForAllDays
            }
            onPress={() => handleSave()}
          >
            {!planningId ? "Créer le planning" : "Sauvegarder les modifications"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};