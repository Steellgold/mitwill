import { useEffect, type ReactElement, useState } from "react";
import { Avatar, Button, Card, Text } from "react-native-paper";
import { calculateDiff, calculateNightHours, calculateTimeBeyond, isBeyond6Hours, majdate } from "../../dayjs/day-js.utils";
import { dayJS } from "../../dayjs/day-js";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import type { SimpleDiff } from "../../dayjs/day-js.types";
import { View } from "react-native";

export const CheckCard = (): ReactElement => {
  const { session, activeCheck, checks } = useSession();
  if (!session) return <NoCheckCard type="session" />;
  if (!activeCheck) return <NoCheckCard type={
    checks.filter((check) => dayJS(check.start).dayOfYear() === dayJS().dayOfYear()).length > 0
      ? "daily-already-ended"
      : "daily"
  } />;

  const [showSeconds, setShowSeconds] = useState(false);

  const [time, setTime] = useState<SimpleDiff>({ days: "0", hours: "0", minutes: "0", seconds: "0" });

  const checkStartedYesterday = dayJS(activeCheck.start).dayOfYear() < dayJS().dayOfYear();

  const nightTime = calculateNightHours(dayJS(activeCheck.start), dayJS());
  const beyondTime = calculateTimeBeyond(dayJS(activeCheck.start), dayJS(), activeCheck.pauseTaken);
  const eligibleTo20mPause = isBeyond6Hours(dayJS(activeCheck.start), dayJS());

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = calculateDiff(activeCheck.start, dayJS().format());
      setTime(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <Card.Title title={
        checkStartedYesterday
          ? `Vous avez commencé à travailler le ${dayJS(activeCheck.start).format("ddd[.] DD/MM")}`
          : majdate(activeCheck.start)
      } />

      <Card.Content>
        <Card>
          <Card.Title
            title={"Vous travaillez depuis:"}
            subtitle={showSeconds
              ? `${time.hours} heures, ${time.minutes} minutes et ${time.seconds} secondes`
              : `${time.hours} heures et ${time.minutes} minutes`
            }
            subtitleVariant="bodyLarge"
            titleVariant="bodySmall"
            subtitleStyle={{ marginTop: -15 }}
          />
        </Card>

        {nightTime.minutes !== "00" && (
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Avatar.Icon icon="moon-waning-crescent" size={16} />
            {nightTime.hours !== "00" ? (
              <Text style={{ fontSize: 12 }}>Actuellement en heures de nuits depuis&nbsp;
                <Text style={{ fontWeight: "bold", color: "#6750a4" }}>{nightTime.hours} heures</Text> et
                <Text style={{ fontWeight: "bold", color: "#6750a4" }}>&nbsp;{nightTime.minutes} minutes</Text>
              </Text>
            ) : (
              <Text style={{ fontSize: 12 }}>Actuellement en heures de nuits depuis&nbsp;
                <Text style={{ fontWeight: "bold", color: "#6750a4" }}>{nightTime.minutes} minutes</Text>
              </Text>
            )}
          </View>
        )}

        {beyondTime.minutes !== "00" && (
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Avatar.Icon icon="timer-sand" size={16} />
            {beyondTime.hours !== "00" ? (
              <Text style={{ fontSize: 12 }}>
                En heures supplémentaires depuis&nbsp;
                <Text style={{ fontWeight: "bold", color: "#6750a4" }}>{beyondTime.hours} heures</Text>
                &nbsp;et <Text style={{ fontWeight: "bold", color: "#6750a4" }}>{beyondTime.minutes} minutes</Text>
              </Text>
            ) : (
              <Text style={{ fontSize: 12 }}>Actuellement en heures supplémentaires depuis&nbsp;
                <Text style={{ fontWeight: "bold", color: "#6750a4" }}>{beyondTime.minutes} minutes</Text>
              </Text>
            )}
          </View>
        )}

        {eligibleTo20mPause && (
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Avatar.Icon icon="coffee" size={16} />
            <Text style={{ fontSize: 12 }}>
              Une pause de 20 minutes est obligatoire après 6 heures de travail consécutives !
            </Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button mode="text" onPress={() => setShowSeconds(!showSeconds)}>
          {showSeconds ? "Masquer les secondes" : "Afficher les secondes"}
        </Button>
      </Card.Actions>
    </Card>
  );
};