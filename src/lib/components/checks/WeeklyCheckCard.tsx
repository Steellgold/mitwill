import { useState, type ReactElement, useEffect } from "react";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import { useAsync } from "../../hooks/useAsync";
import { supabase } from "../../db/supabase";
import { dayJS } from "../../dayjs/day-js";
import { ActivityIndicator, Button, Card, Chip, DataTable, Icon, IconButton, Text, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { Check } from "../../providers/session";
import { View } from "react-native";
// @ts-ignore
import GifImage from "@lowkey/react-native-gif";
import type { PauseDiff } from "../../dayjs/day-js.types";
import { type DiffWithWT } from "../../dayjs/day-js.types";
import { calculateMultiple, calculateTotalPauseTimeDetailed } from "../../dayjs/day-js.utils";
import { MiniCard } from "../../../pages/check/CheckInfoScreen";

type WeeklyCheckCardProps = {
  specificUserId?: string;
  startDate?: string;
  endDate?: string;
};

export const WeeklyCheckCard = ({ specificUserId, endDate, startDate }: WeeklyCheckCardProps): ReactElement => {
  const { session, needDataRefresh } = useSession();
  if (!session) return <NoCheckCard type="weekly" />;
  const { navigate } = useNavigation();

  const [week, setWeek] = useState<string>(dayJS().format("YYYY-MM-DD"));
  const [checks, setChecks] = useState<Check[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [weekDiffWithWT, setWeekDiffWithWT] = useState<DiffWithWT>({
    days: "0",
    hours: "0",
    minutes: "0",
    seconds: "0",
    nbrSupps: { hours: "00", minutes: "00" },
    nbrNights: { hours: "00", minutes: "00" },
    workTime: { hours: "00", minutes: "00" }
  });

  const [weekTimePauseTaken, setWeekTimePauseTaken] = useState<PauseDiff>({
    days: "0",
    hours: "0",
    minutes: "0",
    seconds: "0",
    nbr20Taken: 0,
    nbr45Taken: 0
  });

  const [r, setR] = useState<number>(0);

  const fetchChecks = async(weekToFetch: string, endDate?: string): Promise<void> => {
    setLoading(true);

    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", specificUserId || session.user.id)
      .gte("date", dayJS(weekToFetch).startOf("week").format("YYYY-MM-DD"))
      .lte("date", dayJS(
        endDate || dayJS(weekToFetch).endOf("week").format("YYYY-MM-DD")
      ).endOf("week").format("YYYY-MM-DD"))
      .order("date", { ascending: false });

    if (error) {
      console.error("Error:WCC", error.message);
    } else {
      setChecks(data || []);
      setWeekDiffWithWT(calculateMultiple(data || []));
      setWeekTimePauseTaken(calculateTotalPauseTimeDetailed(data || []));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChecks(
      (startDate || dayJS(week).startOf("week").format("YYYY-MM-DD")),
      endDate
    )
      .then(() => console.log(`Checks fetched for the week of ${week}`))
      .catch((error) => console.error("Error:", error));
  }, [week, needDataRefresh, r]);

  useAsync(async() => {
    const { data, error } = await supabase
      .from("checks")
      .select("*")
      .eq("userId", specificUserId || session.user.id)
      .gte("date", dayJS(
        (startDate || dayJS(week).startOf("week").format("YYYY-MM-DD"))
      ).startOf("week").format("YYYY-MM-DD"))
      .lte("date", dayJS(
        (endDate || dayJS(week).endOf("week").format("YYYY-MM-DD"))
      ).endOf("week").format("YYYY-MM-DD"))
      .order("date", { ascending: true });

    if (error) setChecks([]);
    else setChecks(data || []);
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
    <>
      <Card>
        <Card.Title
        // add a 's' to "Semaine" if startDate or endDate is defined and total is more than 1 week
          title={`Semaine${
            (startDate || endDate) && dayJS(endDate || dayJS(week).endOf("week").format("YYYY-MM-DD")).diff(
              dayJS(startDate || dayJS(week).startOf("week").format("YYYY-MM-DD")), "week"
            ) > 0 ? "s" : ""
          } du ${dayJS(
            (startDate || dayJS(week).startOf("week").format("YYYY-MM-DD"))
          ).startOf("week").format("DD MMMM")} au ${dayJS(
            (endDate || dayJS(week).endOf("week").format("YYYY-MM-DD"))
          ).endOf("week").add(-2, "d").format("DD MMMM")}`}
          subtitle={
            dayJS(week).isSame(dayJS(), "week")
              ? "Liste des pointages de la semaine actuelle"
              : dayJS(week).isBefore(dayJS(), "week")
                ? "Liste des pointages de la semaine passée"
                : "Liste des pointages de la semaine à venir"
          }
          subtitleVariant="bodySmall"
          subtitleStyle={{ marginTop: -5 }}
        />

        <DataTable style={{ padding: 4 }}>
          <DataTable.Header>
            <DataTable.Title style={{ flex: 2 }}>Date</DataTable.Title>
            <DataTable.Title numeric>Début</DataTable.Title>
            <DataTable.Title numeric>Sortie</DataTable.Title>
          </DataTable.Header>

          {loading ? (
            <DataTable.Row style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator animating color="#fd7e46" size="large"/>
            </DataTable.Row>
          ) : checks.length === 0 ? (
            <>
              {dayJS(week).isAfter(dayJS(), "week") && dayJS(week).diff(dayJS(), "week") >= 3 ? (
                <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <GifImage
                    source={{ uri: "https://i0.wp.com/quartierdudigital.fr/wp-content/uploads/2015/10/8.gif" }}
                    style={{ width: 200, height: 200, flex: 1 }}
                    resizeMode="contain"
                  />

                  <Text style={{ textAlign: "center" }}>Wow, tu es en avance sur ton temps ! 🤯</Text>
                </View>
              ) : (
                <DataTable.Row>
                  <DataTable.Cell>Aucun pointage cette semaine pour le moment</DataTable.Cell>
                </DataTable.Row>
              )}
            </>
          ) : checks.map((check) => (
            <TouchableRipple
              borderless
              disabled={!check.end}
              // @ts-ignore
              onPress={(): void => navigate("CheckInfoScreen", {
                check: check,
                isManager: specificUserId ? true : false
              })} key={check.uuid}>
              <DataTable.Row style={{ position: "relative" }}>
                <DataTable.Cell style={{ flex: check.end ? 2 : 1 }}>
                  {check.need_validation ? <Chip icon="calendar-clock">
                    {dayJS(check.date).format(`ddd ${
                      dayJS(check.end).format("DD/MM/YYYY") === dayJS(check.start).format("DD/MM/YYYY") ? "DD/MM"
                        : !check.end ? "DD/MM" : ""
                    }`)}
                    {dayJS(check.start).dayOfYear() < dayJS(check.end).dayOfYear() ? dayJS(check.end).format("→ ddd DD/MM") : ""}
                  </Chip>
                    : <Text>
                      {dayJS(check.date).format(`ddd ${
                        dayJS(check.end).format("DD/MM/YYYY") === dayJS(check.start).format("DD/MM/YYYY") ? "DD/MM"
                          : !check.end ? "DD/MM" : ""
                      }`)}
                      {dayJS(check.start).dayOfYear() < dayJS(check.end).dayOfYear() ? dayJS(check.end).format("→ ddd DD/MM") : ""}
                    </Text>}
                </DataTable.Cell>
                <DataTable.Cell numeric>{dayJS(check.start).format("HH[h ]mm[m]")}</DataTable.Cell>
                {check.end
                  ? <DataTable.Cell numeric>{dayJS(check.end).format("HH[h ]mm[m]")}</DataTable.Cell>
                  : <DataTable.Cell numeric>
                    <Chip icon="clock-time-four-outline">
                      En cours
                    </Chip>
                  </DataTable.Cell>
                }
              </DataTable.Row>
            </TouchableRipple>
          ))}
        </DataTable>

        {checks.length > 0 && (
          <>
            <View style={{ padding: 15, flexDirection: "row", gap: 10, marginBottom: -15 }}>
              <MiniCard title="Temps de travail" subtitle={`${weekDiffWithWT.workTime.hours}h ${weekDiffWithWT.workTime.minutes}m`} />
              <MiniCard title="Nombre de nuits" subtitle={`${weekDiffWithWT.nbrNights.hours}h ${weekDiffWithWT.nbrNights.minutes}m`} />
            </View>

            <View style={{ padding: 15, flexDirection: "row", gap: 10 }}>
              <MiniCard title="Heures supp." subtitle={`${weekDiffWithWT.nbrSupps.hours}h ${weekDiffWithWT.nbrSupps.minutes}m`} />
              <MiniCard title="Temps de pause*" subtitle={`${weekTimePauseTaken.hours}h ${weekTimePauseTaken.minutes}m`} />
            </View>

            <Text variant="bodySmall" style={{ margin: 15, marginTop: 0, color: "rgba(0, 0, 0, 0.54)" }}>
              * Temps de pause total pris sur {
                (startDate || endDate) && dayJS(endDate || dayJS(week).endOf("week").format("YYYY-MM-DD")).diff(
                  dayJS(startDate || dayJS(week).startOf("week").format("YYYY-MM-DD")), "week"
                ) > 0 ? "les" : "la"
              }{" "}
              semaine, incluant les pauses de 20 minutes obligatoires
            </Text>


            <Text variant="bodySmall" style={{ margin: 15, marginTop: 0, color: "rgba(0, 0, 0, 0.54)" }}>
              Note temporaire: La case "Temps de travail" ne prend pas en compte les pauses.</Text>
          </>
        )}

        {!startDate && !endDate && (
          <Card.Actions style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
              <Button
                mode="text"
                onPress={() => setR(r + 1)}
                labelStyle={{ color: "#1e1e1e" }}
                disabled={loading}
                icon={() => <Icon size={16} source={"refresh"} />}
                style={{ alignSelf: "flex-start" }}
              >
                Rafraîchir
              </Button>
            </View>

            <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
              <IconButton
                mode="contained-tonal"
                onPress={() => void handleSwitchWeek("previous")}
                icon={() => <Icon size={16} source={"arrow-left"} />}
              />
              <IconButton
                mode="contained-tonal"
                disabled={dayJS(week).isSame(dayJS(), "week")}
                onPress={() => void handleSwitchWeek("reset")}
                icon={() => <Icon size={16} source={"calendar-today"} />}
              />
              <IconButton
                mode="contained-tonal"
                onPress={() => void handleSwitchWeek("next")}
                icon={() => <Icon size={16} source={"arrow-right"} />}
              />
            </View>
          </Card.Actions>
        )}
      </Card>
    </>
  );
};