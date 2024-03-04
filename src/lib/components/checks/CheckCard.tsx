import type { ReactElement } from "react";
import { Card } from "react-native-paper";
import { majdate } from "../../dayjs/day-js.utils";
import { dayJS } from "../../dayjs/day-js";
import { useSession } from "../../hooks/useSession";
import { NoCheckCard } from "./NoCheckCard";

export const CheckCard = (): ReactElement => {
  const { session, activeCheck } = useSession();
  if (!session) return <NoCheckCard type="session" />;
  if (!activeCheck) return <NoCheckCard type="daily" />;

  return (
    <Card>
      <Card.Title
        title={majdate(activeCheck?.date || dayJS().toDate())}
        subtitle={`Vous avez commencé à travailler à ${dayJS(activeCheck?.start).format("HH:mm")}`}
        subtitleStyle={{ marginTop: -5 }}
      />
    </Card>
  );
};