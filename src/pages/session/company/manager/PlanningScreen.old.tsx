/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, type ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, Checkbox, Chip, Divider, IconButton, Menu, SegmentedButtons, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { Dayjs } from "../../../../lib/dayjs/day-js";
import { dayJS } from "../../../../lib/dayjs/day-js";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../../../App";
import { ChooseEmployeesDialog } from "./dialogs/ChooseEmployees";
import { ChooseTimeDialog } from "./dialogs/ChooseTime";
import { supabase } from "../../../../lib/db/supabase";
import { useSession } from "../../../../lib/hooks/useSession";
import type { DayTimes, PlanningData } from "./types";
import { useAsync } from "../../../../lib/hooks/useAsync";

type Props = NativeStackScreenProps<RootStackParamList, "CUPlanningScreen">;

/**
 * Why CU[...]Screen?
 * CU stands for Create/Update, it's a convention I use to name screens that are used to create or update a resource.
 */
export const CUPlanningScreen = ({ navigation, route }: Props): ReactElement => {
  const week = dayJS(route.params?.date).startOf("week");
  const planningId = route.params?.planningId;
  const { session } = useSession();

  const [canStartSunday, setCanStartSunday] = useState(false);
  const [initialData, setInitialData] = useState<PlanningData | null>(null);

  const [dayTimes, setDayTimes] = useState<DayTimes>({
    sunday: { start: undefined, end: undefined, disabled: !canStartSunday },
    monday: { start: undefined, end: undefined, disabled: false },
    tuesday: { start: undefined, end: undefined, disabled: false },
    wednesday: { start: undefined, end: undefined, disabled: false },
    thursday: { start: undefined, end: undefined, disabled: false },
    friday: { start: undefined, end: undefined, disabled: false },
    saturday: { start: undefined, end: undefined, disabled: true }
  });

  type ToggleDayProps = "sunday" | "saturday";

  const toggleDay = (day: ToggleDayProps): void => {
    if (day === "sunday") {
      const { disabled } = dayTimes.sunday;
      console.log(disabled);
      setDayTimes({
        ...dayTimes,
        sunday: { ...dayTimes.sunday, disabled: !disabled },
        saturday: { ...dayTimes.saturday, disabled: true }
      });
    }

    if (day === "saturday") setDayTimes({ ...dayTimes, saturday: { ...dayTimes.saturday, disabled: !dayTimes.saturday.disabled } });
  };

  const handleWeekTypeChange = (value: "normal" | "night"): void => {
    if (weekType === value) return;

    if ((value === "normal" && weekType === "night") || (value === "night" && weekType === "normal")) {
      setDayTimes({
        ...dayTimes,
        sunday: { ...dayTimes.sunday, disabled: true },
        saturday: { ...dayTimes.saturday, disabled: true }
      });
    }

    setWeekType(value);
    setDayTimes({
      ...dayTimes,
      sunday: { start: undefined, end: undefined, disabled: value === "normal" ? false : !canStartSunday },
      saturday: { start: undefined, end: undefined, disabled: true }
    });
  };

  const [users, setUsers] = useState<string[]>([]);

  const [chooseDialogOpen, setChooseDialogOpen] = useState(false);
  const [chooseDialogOpenPeriod, setChooseDialogOpenPeriod] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);

  const [weekType, setWeekType] = useState<"normal" | "night">("normal");

  const [selectedMenu, setSelectedMenu] = useState<Weekday | null>(null);
  const [clipboard, setClipboard] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const executePlanningOperation = async(planningId: string | undefined, data: PlanningData): Promise<void> => {
    setLoading(true);
    if (planningId) await supabase.from("plannings").update(data).eq("uuid", planningId).then(() => setLoading(false));
    else await supabase.from("plannings").insert(data).then(() => setLoading(false));
  };

  useAsync(async(): Promise<void> => {
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

    if (data) {
      setDayTimes({
        sunday: {
          start: data.sunday_start || undefined,
          end: data.sunday_end || undefined,
          disabled: !data.sunday_start || !data.sunday_end
        },
        monday: { start: data.monday_start || undefined, end: data.monday_end || undefined, disabled: false },
        tuesday: { start: data.tuesday_start || undefined, end: data.tuesday_end || undefined, disabled: false },
        wednesday: {
          start: data.wednesday_start || undefined, end: data.wednesday_end || undefined, disabled: false },
        thursday: { start: data.thursday_start || undefined, end: data.thursday_end || undefined, disabled: false },
        friday: { start: data.friday_start || undefined, end: data.friday_end || undefined, disabled: false },
        saturday: {
          start: data.saturday_start || undefined,
          end: data.saturday_end || undefined,
          disabled: !data.saturday_start || !data.saturday_end
        }
      });

      setWeekType(data.is_night ? "night" : "normal");
      setCanStartSunday(data.sunday_start !== undefined);
      setInitialData({
        by: data.by,
        for: data.for,
        from: data.from,
        to: data.to,
        monday_start: data.monday_start || undefined,
        monday_end: data.monday_end || undefined,
        tuesday_start: data.tuesday_start || undefined,
        tuesday_end: data.tuesday_end || undefined,
        wednesday_start: data.wednesday_start || undefined,
        wednesday_end: data.wednesday_end || undefined,
        thursday_start: data.thursday_start || undefined,
        thursday_end: data.thursday_end || undefined,
        friday_start: data.friday_start || undefined,
        friday_end: data.friday_end || undefined,
        saturday_start: data.saturday_start || undefined,
        saturday_end: data.saturday_end || undefined,
        sunday_start: data.sunday_start || undefined,
        sunday_end: data.sunday_end || undefined,
        is_night: data.is_night
      });

      setUsers(data.for);
    }
  }, [planningId]);

  const isDayTimeDefined = (day: Weekday): boolean => {
    const { start, end } = dayTimes[day];
    return start !== undefined && end !== undefined;
  };

  const areWeekDaysDefinedForNightWeek = dayTimes.sunday.disabled
    ? ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].every(isDayTimeDefined)
    : ["monday", "tuesday", "wednesday", "thursday", "friday"].every(isDayTimeDefined);

  const areWeekDaysDefinedForNormalWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"].every(isDayTimeDefined)
    && (!dayTimes.saturday.disabled ? isDayTimeDefined("saturday") : true);

  const areRequiredDaysDefined = weekType === "night" ? areWeekDaysDefinedForNightWeek : areWeekDaysDefinedForNormalWeek;


  const applyToAll = (day: Weekday): void => {
    const { start, end } = dayTimes[day];
    if (!start || !end) return;

    const newDayTimes = Object.keys(dayTimes).reduce((acc, d) => {
      if (d === "saturday" && dayTimes.saturday.disabled) {
        acc[d] = dayTimes[d];
      } else {
        // @ts-ignore
        acc[d] = { start, end };
      }
      return acc;
    }, {} as DayTimes);

    setDayTimes(newDayTimes);
    setSelectedMenu(null);
  };

  const resetTimes = (): void => {
    setDayTimes({
      monday: { start: undefined, end: undefined, disabled: false },
      tuesday: { start: undefined, end: undefined, disabled: false },
      wednesday: { start: undefined, end: undefined, disabled: false },
      thursday: { start: undefined, end: undefined, disabled: false },
      friday: { start: undefined, end: undefined, disabled: false },
      saturday: { start: undefined, end: undefined, disabled: true },
      sunday: { start: undefined, end: undefined, disabled: !canStartSunday }
    });
  };

  const handleSubmission = async(): Promise<void> => {
    if (!session) return;
    setLoading(true);
    await executePlanningOperation(planningId, {
      by: session.user.id,
      for: users,
      from: week.startOf("week").format("YYYY-MM-DD"),
      to: week.add(4, "days").format("YYYY-MM-DD"),
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
      sunday_start: dayTimes.sunday.start,
      sunday_end: dayTimes.sunday.end,
      is_night: weekType === "night"
    });

    navigation.navigate("PlanningScreen", { date: dayJS().startOf("week").format("YYYY-MM-DD") });
  };

  return (
    <SafeAreaProvider>
      <ScrollView>
        <View style={{ padding: 15, paddingBottom: 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text variant="bodyLarge">Semaine du {week.format("DD/MM")} au {week.add(4, "days").format("DD/MM/YYYY")}</Text>
              <Text variant="bodySmall" style={{ marginTop: 2 }}>Actuellement {users.length} employé(s) sélectionné(s)</Text>
            </View>
            <IconButton icon={"calendar-refresh-outline"} onPress={() => resetTimes()} />
          </View>
          <Divider style={{ marginTop: 10 }} />
        </View>

        <View style={{ padding: 15, paddingBottom: 0 }}>
          <SegmentedButtons
            value={weekType}
            style={{ marginBottom: 15 }}
            // @ts-ignore
            onValueChange={handleWeekTypeChange}
            buttons={[
              { value: "normal", label: "Semaine normale", icon: "white-balance-sunny" },
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
                  start: `${startH}:${startM}:00`,
                  end: `${endH}:${endM}:00`
                }
              });
              setChooseDialogOpenPeriod(false);
            }} />

          {dayTimes && Object.keys(dayTimes).map((i, index) => {
            const day = addDaysBasedOnWeekday(i as Weekday, week);
            if (weekType === "night" && i === "sunday" && dayTimes.sunday.disabled) return null;
            if (weekType === "night" && i === "saturday" && dayTimes.saturday.disabled) return null;
            if (weekType === "normal" && i === "saturday" && dayTimes.saturday.disabled) return null;
            if (weekType === "normal" && i === "sunday") return null;

            console.log(i);

            return (
              <Menu
                anchor={
                  <Card key={index} style={{ marginBottom: 10 }}>
                    <TouchableRipple borderless style={{ borderRadius: 10 }} onPress={() => {
                      setSelectedDay(i as Weekday);
                      setChooseDialogOpenPeriod(true);
                    }} onLongPress={() => setSelectedMenu(i as Weekday)}>
                      <>
                        <Card.Title
                          title={day.format("dddd")}
                          subtitleVariant="bodySmall"
                        />
                        <Card.Content style={{ marginBottom: 10, marginTop: -15 }}>
                          {dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined ? (
                            <Text variant="bodySmall">Cliquez pour définir les heures</Text>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                              <Text>{weekType === "night" ? "Nuit du" : "Début de journée à"}</Text>
                              <Chip icon={"clock"} compact>{removeZeroZero(dayTimes[i as Weekday].start)}</Chip>

                              <Text>{weekType === "night" && i === "saturday" ? "se termine à" : "et se termine à"}</Text>
                              <Chip icon={"clock"} compact>{removeZeroZero(dayTimes[i as Weekday].end)}</Chip>
                            </View>
                          )}
                        </Card.Content>
                      </>
                    </TouchableRipple>
                  </Card>
                }
                visible={selectedMenu === i}
                onDismiss={() => setSelectedMenu(null)}
              >
                <Menu.Item
                  onPress={() => applyToAll(i as Weekday)}
                  title="Appliquer à tous"
                  disabled={
                    dayTimes[i as Weekday].start === undefined || dayTimes[i as Weekday].end === undefined
                    || (i === "saturday" && dayTimes.saturday.disabled)
                  }
                  leadingIcon={"calendar-multiselect"} />

                <Menu.Item
                  onPress={() => {
                    setDayTimes({ ...dayTimes, [i as Weekday]: { start: undefined, end: undefined } });
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
                    setDayTimes({ ...dayTimes, [i as Weekday]: { start: clipboard.start, end: clipboard.end } });
                    setSelectedMenu(null);
                  }}
                  title="Coller"
                  disabled={(i === "saturday" && dayTimes.saturday.disabled)}
                  leadingIcon={"content-paste"} />
              </Menu>
            );
          })}

          {weekType === "normal" && (
            <Checkbox.Item
              label="Ajouter le samedi"
              status={dayTimes.saturday.disabled ? "unchecked" : "checked"}
              onPress={() => toggleDay("saturday")}
            />
          )}

          {weekType === "night" && (
            <Card style={{ marginTop: 10 }}>
              <Card.Content>
                <Checkbox.Item label={"Peut commencer le dimanche"} status={dayTimes.sunday.disabled ? "unchecked" : "checked"}
                  onPress={() => toggleDay("sunday")} />

                <Text variant="bodySmall" style={{ marginTop: 10 }}>
                  Si il peut commencer le dimanche, alors l'employée peut commencer le dimanche à 00:00 et finir le vendredi à 23:59.
                </Text>
              </Card.Content>
            </Card>
          )}

          <Divider style={{ marginTop: 10 }} />

          <Button
            mode="contained"
            loading={loading}
            disabled={loading || users.length === 0 || !areRequiredDaysDefined}
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

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const addDaysBasedOnWeekday = (weekday: Weekday, baseDay: Dayjs): Dayjs => {
  const currentDay = baseDay;
  const daysToAdd: Record<Weekday, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6
  };

  if (weekday === "sunday") return currentDay.add(daysToAdd[weekday], "day").add(-7, "day");
  return currentDay.add(daysToAdd[weekday], "day");
};

const removeZeroZero = (time: string | undefined): string | undefined => {
  if (!time) return undefined;
  return time.split(":").slice(0, 2).join(":");
};