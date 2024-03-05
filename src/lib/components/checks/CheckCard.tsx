import { useEffect, type ReactElement, useState } from "react";
import { Button, Card } from "react-native-paper";
import { calculateDiff, majdate } from "../../dayjs/day-js.utils";
import { dayJS } from "../../dayjs/day-js";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";
import type { Diff } from "../../dayjs/day-js.types";

export const CheckCard = (): ReactElement => {
  const { session, activeCheck } = useSession();
  if (!session) return <NoCheckCard type="session" />;
  if (!activeCheck) return <NoCheckCard type="daily" />;

  const [showSeconds, setShowSeconds] = useState(false);

  const [time, setTime] = useState<Diff>({
    days: "0", hours: "0", minutes: "0", seconds: "0",
    nbrNights: { hours: "0", minutes: "0" },
    nbrSupps: { hours: "0", minutes: "0" }
  });

  const checkStartedYesterday = dayJS(activeCheck.start).dayOfYear() < dayJS().dayOfYear();

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
      </Card.Content>

      <Card.Actions>
        <Button mode="text" onPress={() => setShowSeconds(!showSeconds)}>
          {showSeconds ? "Masquer les secondes" : "Afficher les secondes"}
        </Button>
      </Card.Actions>
    </Card>
  );
};