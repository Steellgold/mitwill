/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, type ReactElement, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, Checkbox, Chip, Divider, Menu, SegmentedButtons, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { Dayjs } from "../../../../lib/dayjs/day-js";
import { dayJS } from "../../../../lib/dayjs/day-js";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../../../App";
import { ChooseEmployeesDialog } from "./dialogs/ChooseEmployees";
import { ChooseTimeDialog } from "./dialogs/ChooseTime";
import { supabase } from "../../../../lib/db/supabase";
import { useSession } from "../../../../lib/hooks/useSession";
import type { DayTimes } from "./types";

type Props = NativeStackScreenProps<RootStackParamList, "CUPlanningScreen">;

/**
 * Why CU[...]Screen?
 * CU stands for Create/Update, it's a convention I use to name screens that are used to create or update a resource.
 */
export const CUPlanningScreen = ({ navigation, route }: Props): ReactElement => {
  const week = dayJS(route.params?.date).startOf("week");
  const planningId = route.params?.planningId;
  const { session } = useSession();

  const [dayTimes, setDayTimes] = useState<DayTimes>({
    monday: { start: undefined, end: undefined },
    tuesday: { start: undefined, end: undefined },
    wednesday: { start: undefined, end: undefined },
    thursday: { start: undefined, end: undefined },
    friday: { start: undefined, end: undefined },
    saturday: { start: undefined, end: undefined, disabled: true }
  });

  const toggleSaturday = (): void => {
    const { disabled } = dayTimes.saturday;
    setDayTimes({
      ...dayTimes,
      saturday: {
        ...dayTimes.saturday,
        disabled: !disabled
      }
    });

    if (!disabled) {
      setDayTimes({
        ...dayTimes,
        saturday: {
          start: undefined,
          end: undefined,
          disabled: true
        }
      });
    }
  };

  const [users, setUsers] = useState<string[]>([]);

  const [chooseDialogOpen, setChooseDialogOpen] = useState(false);
  const [chooseDialogOpenPeriod, setChooseDialogOpenPeriod] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);

  const [weekType, setWeekType] = useState<"normal" | "night">("normal");

  const [selectedMenu, setSelectedMenu] = useState<Weekday | null>(null);
  const [clipboard, setClipboard] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlanningData = async(): Promise<void> => {
      if (!planningId) return;

      const { data, error } = await supabase
        .from("plannings")
        .select("*")
        .eq("uuid", planningId)
        .single();

      if (error) {
        console.error("Erreur lors du chargement du planning", error);
        return;
      }

      const removeSeconds = (time: string | null): string | undefined => {
        if (!time) return undefined;
        return time.split(":").slice(0, 2).join(":");
      };

      if (data) {
        setDayTimes({
          monday: { start: removeSeconds(data.monday_start) || undefined, end: removeSeconds(data.monday_end) || undefined },
          tuesday: { start: removeSeconds(data.tuesday_start) || undefined, end: removeSeconds(data.tuesday_end) || undefined },
          wednesday: { start: removeSeconds(data.wednesday_start) || undefined, end: removeSeconds(data.wednesday_end) || undefined },
          thursday: { start: removeSeconds(data.thursday_start) || undefined, end: removeSeconds(data.thursday_end) || undefined },
          friday: { start: removeSeconds(data.friday_start) || undefined, end: removeSeconds(data.friday_end) || undefined },
          saturday: {
            start: removeSeconds(data.saturday_start) || undefined,
            end: removeSeconds(data.saturday_end) || undefined,
            disabled: !data.saturday_start || !data.saturday_end
          }
        });

        setUsers(data.for);
      }
    };

    void fetchPlanningData();
  }, [planningId]);

  const handleSubmission = async(): Promise<void> => {
    if (!session) return;
    setLoading(true);
    if (planningId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await supabase.from("plannings").update({
        by: session.user.id,
        for: users,
        from: week.startOf("week").format("YYYY-MM-DD"),
        to: week.endOf("week").format("YYYY-MM-DD"),
        monday_start: dayTimes.monday.start,
        monday_end: dayTimes.monday.end,
        tuesday_start: dayTimes.tuesday.start,
        tuesday_end: dayTimes.tuesday.end,
        wednesday_start: dayTimes.wednesday.start,
        wednesday_end: dayTimes.wednesday.end,
        thursday_start: dayTimes.thursday.start,
        thursday_end: dayTimes.thursday.end,
        friday_start: dayTimes.friday.start,
        friday_end: dayTimes.friday.end,
        saturday_start: dayTimes.saturday.start,
        saturday_end: dayTimes.saturday.end,
        is_night: weekType === "night"
      }).eq("uuid", planningId)
        .then(() => setLoading(false));
    } else {
      await supabase.from("plannings").insert({
        by: session.user.id,
        for: users,
        from: week.startOf("week").format("YYYY-MM-DD"),
        to: week.endOf("week").format("YYYY-MM-DD"),
        monday_start: dayTimes.monday.start,
        monday_end: dayTimes.monday.end,
        tuesday_start: dayTimes.tuesday.start,
        tuesday_end: dayTimes.tuesday.end,
        wednesday_start: dayTimes.wednesday.start,
        wednesday_end: dayTimes.wednesday.end,
        thursday_start: dayTimes.thursday.start,
        thursday_end: dayTimes.thursday.end,
        friday_start: dayTimes.friday.start,
        friday_end: dayTimes.friday.end,
        saturday_start: dayTimes.saturday.start,
        saturday_end: dayTimes.saturday.end,
        is_night: weekType === "night"
      }).then(() => setLoading(false));
    }

    navigation.navigate("PlanningScreen", { date: dayJS().startOf("week").format("YYYY-MM-DD") });
  };

  return (
    <SafeAreaProvider>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <Text variant="bodyLarge">Semaine du {week.format("DD/MM")} au {week.add(4, "days").format("DD/MM/YYYY")}</Text>
          <Text variant="bodySmall" style={{ marginTop: 2 }}>Actuellement {users.length} employé(s) sélectionné(s)</Text>
          <Divider style={{ marginTop: 10 }} />
        </View>

        <View style={{ padding: 15 }}>
          <SegmentedButtons
            value={weekType}
            style={{ marginBottom: 15 }}
            // @ts-ignore
            onValueChange={(value: "normal" | "night") => setWeekType(value)}
            buttons={[
              { value: "normal", label: "Semaine normale", icon: "calendar" },
              { value: "night", label: "Semaine de nuit", icon: "moon-waning-crescent" }
            ]}
          />

          <ChooseTimeDialog
            date={selectedDay ? addDaysBasedOnWeekday(selectedDay, week).format("YYYY-MM-DD") : ""}
            isNightWeek={false}
            visible={chooseDialogOpenPeriod}
            hideDialog={() => setChooseDialogOpenPeriod(false)}
            onDismiss={() => setChooseDialogOpenPeriod(false)}
            onConfirm={({ startH, startM, endH, endM }) => {
              setDayTimes({
                ...dayTimes,
                [selectedDay as Weekday]: {
                  start: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`,
                  end: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`
                }
              });
              setChooseDialogOpenPeriod(false);
            }} />

          {dayTimes && Object.keys(dayTimes).map((i) => {
            const day = addDaysBasedOnWeekday(i as Weekday, week);
            if (dayTimes.saturday.disabled && i === "saturday") return <></>;

            return (
              <Menu
                anchor={
                  <>
                    <Card key={i} style={{ marginBottom: 10 }}>
                      <TouchableRipple borderless style={{ borderRadius: 10 }} onPress={() => {
                        setSelectedDay(i as Weekday);
                        setChooseDialogOpenPeriod(true);
                      }} onLongPress={() => setSelectedMenu(i as Weekday)}>
                        <>
                          <Card.Title title={day.format("dddd").charAt(0).toUpperCase() + day.format("dddd").slice(1)} style={{ marginBottom: 10 }} />
                          <Card.Content style={{ marginBottom: 10, marginTop: -15 }}>
                            {dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined ? (
                              <Text variant="bodySmall">Cliquez pour définir les heures</Text>
                            ) : (
                              <>
                                {weekType === "night" ? (
                                  <>
                                    {i === "saturday" ? (
                                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                        <Text>Nuit du</Text>
                                        <Chip icon={"calendar"} compact>{day.add(-1, "day").format("ddd DD/MM")}</Chip>
                                        <Text>se termine à</Text>
                                        <Chip icon={"clock"} compact>{dayTimes[i as Weekday].end}</Chip>
                                      </View>
                                    ) : (
                                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                        <Text>Début de journée à</Text>
                                        <Chip compact>{dayTimes[i as Weekday].start}</Chip>
                                        <Text>et se termine le lendemain à</Text>
                                        <Chip compact>{dayTimes[i as Weekday].end}</Chip>
                                      </View>
                                    )}
                                  </>
                                ) : (
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <Text>Début de journée à</Text>
                                    <Chip compact>{dayTimes[i as Weekday].start}</Chip>
                                    <Text>et se termine à</Text>
                                    <Chip compact>{dayTimes[i as Weekday].end}</Chip>
                                  </View>
                                )}
                              </>
                            )}
                          </Card.Content>
                        </>
                      </TouchableRipple>
                    </Card>
                  </>
                }
                visible={selectedMenu === i}
                onDismiss={() => setSelectedMenu(null)}
              >
                <Menu.Item
                  onPress={() => {
                    const { start, end } = dayTimes[i as Weekday];
                    if (!start || !end) return;

                    const newDayTimes = Object.keys(dayTimes).reduce((acc, day) => {
                      if (day === "saturday" && dayTimes.saturday.disabled) {
                        acc[day] = dayTimes[day];
                      } else {
                        // @ts-ignore
                        acc[day] = { start, end };
                      }
                      return acc;
                    }, {} as DayTimes);

                    setDayTimes(newDayTimes);
                    setSelectedMenu(null);
                  }}
                  title="Appliquer à tous"
                  disabled={
                    dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined
                    || (i === "saturday" && dayTimes.saturday.disabled)
                  }
                  leadingIcon={"calendar-multiselect"} />

                <Menu.Item
                  onPress={() => {
                    setDayTimes({
                      ...dayTimes,
                      [i as Weekday]: {
                        start: undefined,
                        end: undefined
                      }
                    });
                    setSelectedMenu(null);
                  }}
                  title="Réinitialiser"
                  disabled={
                    dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined
                    || (i === "saturday" && dayTimes.saturday.disabled)
                  }
                  leadingIcon={"calendar-remove"} />

                <Menu.Item
                  onPress={() => {
                    if (dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined) return;
                    const { start, end } = dayTimes[i as Weekday];
                    if (!start || !end) return;
                    setClipboard({ start, end });
                    setSelectedMenu(null);
                  }}
                  title="Copier"
                  disabled={
                    dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined
                    || (i === "saturday" && dayTimes.saturday.disabled)
                  }
                  leadingIcon={"content-copy"} />

                <Menu.Item
                  onPress={() => {
                    if (!clipboard) return;
                    setDayTimes({
                      ...dayTimes,
                      [i as Weekday]: {
                        start: clipboard.start,
                        end: clipboard.end
                      }
                    });
                    setSelectedMenu(null);
                  }}
                  title="Coller"
                  disabled={
                    (i === "saturday" && dayTimes.saturday.disabled)
                  }
                  leadingIcon={"content-paste"} />
              </Menu>

            );
          })}

          <Checkbox.Item
            label="Ajouter le samedi"
            status={dayTimes.saturday.disabled ? "unchecked" : "checked"}
            onPress={toggleSaturday}
          />

          <Divider style={{ marginTop: 10 }} />

          <Button
            mode="contained"
            loading={loading}
            disabled={
              loading
              || users.length === 0
              || Object.keys(dayTimes).some((i) => {
                if (i === "saturday" && dayTimes.saturday.disabled) return false;
                return dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined;
              })
            }
            onPress={handleSubmission}
            style={{ marginTop: 10 }}
            icon="calendar-plus"
          >
            {planningId ? "Mettre à jour le planning" : "Créer le planning"}
          </Button>

          <ChooseEmployeesDialog
            visible={chooseDialogOpen}
            hideDialog={() => setChooseDialogOpen(false)}
            onDismiss={() => setChooseDialogOpen(false)}
            defaultSelectedUsersIds={users || []}
            onConfirm={(users) => {
              setUsers(users.map((u) => u.userId));
              setChooseDialogOpen(false);
            }} />

          <Button mode="contained-tonal" onPress={() => setChooseDialogOpen(true)} style={{ marginTop: 10 }} icon="account-multiple-plus">
            {users.length > 0
              ? "Modifier les employés sélectionnés"
              : "Définir qui est concerné"}
          </Button>

          <Button mode="contained-tonal" onPress={() => console.log("clicked")} style={{ marginTop: 10 }} icon="calendar-multiple" disabled>
            Copier un planning existant
          </Button>

          <Divider style={{ marginTop: 10 }} />
        </View>

        <View style={{ padding: 15 }}>
          <Text style={{ fontWeight: "bold" }}>Note:</Text>
          <Text>- Les cartes sont cliquables, une fois cliquées, elles afficheront un sélecteur de temps pour le début et la fin de la journée.</Text>
          <Text>- Vous pouvez laisser appuyé sur une carte pour avoir des options supplémentaires (appliquer à tous, etc)</Text>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

const addDaysBasedOnWeekday = (weekday: Weekday, baseDay: Dayjs): Dayjs => {
  const currentDay = baseDay;
  const daysToAdd: Record<Weekday, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5
  };

  const days = daysToAdd[weekday];
  return currentDay.add(days, "day");
};