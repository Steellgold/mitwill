import type { ReactElement } from "react";
import { Card } from "react-native-paper";
import { dayJS } from "../../dayjs/day-js";
import { majdate } from "../../dayjs/day-js.utils";

type Props = {
  type: "daily" | "weekly" | "session" | "daily-already-ended";
};

export const NoCheckCard = ({ type = "daily" }: Props): ReactElement => {
  return (
    <Card>
      <Card.Title
        title={
          type === "daily"
            ? majdate(dayJS().toDate()) : type === "daily-already-ended"
              ? "Journée terminée"

              : type === "weekly"
                ? `Semaine du ${dayJS().startOf("week").format("DD MMMM")} au ${dayJS().endOf("week").format("DD MMMM")}`
                : "Session non détectée"
        }
        subtitle={
          type === "daily"
            ? "Vous n'avez pas encore commencé à travailler aujourd'hui ou vous n'avez pas encore pointé votre arrivée"
            : type === "daily-already-ended"
              ? "Vore journée de travail est déjà terminée, vous ne pouvez plus pointer"
              : type === "weekly"
                ? "Vous n'avez pas encore pointé votre arrivée cette semaine, pensez à le faire tous les jours"
                : "La session n'est pas détectée, redémarrez l'application ou reconnectez-vous"
        }
        subtitleVariant="bodySmall"
        subtitleNumberOfLines={6}
        titleStyle={{ marginTop: 10 }}
        subtitleStyle={{ marginTop: -5, marginBottom: 12 }}
      />
    </Card>
  );
};