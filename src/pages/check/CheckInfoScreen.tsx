import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type  { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { dayJS } from "../../lib/dayjs/day-js";
import { calculateDiff, majdate } from "../../lib/dayjs/day-js.utils";
import type { Diff } from "../../lib/dayjs/day-js.types";

type Props = NativeStackScreenProps<RootStackParamList, "CheckInfoScreen">;

export const CheckInfoScreen = ({ route }: Props): ReactElement => {
  if (!route.params) {
    return <View />;
  }

  let duration: Diff = calculateDiff(route.params.start, dayJS().format());
  if (route.params.end) {
    duration = calculateDiff(route.params.start, route.params.end);
  }

  return (
    <View style={{ padding: 15 }}>
      <Card>
        <Card.Title
          title={majdate(dayJS(route.params.date))}
          subtitle="Informations détaillées"
          subtitleStyle={{ marginTop: -5 }}
        />

        <Card.Content style={{ padding: 10 }}>
          <Card>
            <Card.Title title="votre journée" subtitle={""} subtitleStyle={{ marginTop: -5 }}/>

            <Card.Content>
              <Text variant="bodySmall">Début de journée à: <Text style={styles.bold}>{dayJS(route.params.start).format("HH[h]mm[m]")}</Text></Text>
              {route.params.end ? (
                <Text variant="bodySmall">Fin de journée à: <Text style={styles.bold}>{dayJS(route.params.end).format("HH[h]mm[m]")}</Text></Text>
              ) : (
                <Text variant="bodySmall">Vous êtes actuellement entrain de travailler</Text>
              )}

              <Text variant="bodySmall">Durée de travail: <Text style={styles.bold}>{duration.hours}h{duration.minutes}m</Text></Text>
            </Card.Content>
          </Card>
        </Card.Content>

        {/* <View style={{ flexDirection: "row", gap: 10, margin: 10 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Début" subtitle={dayJS(route.params.start).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            {route.params.end ? (
              <Card>
                <Card.Title title="Fin" subtitle={dayJS(route.params.end).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
              </Card>
            ) : (
              <Card>
                <Card.Title title="Fin" subtitle="En cours" subtitleStyle={{ marginTop: -5 }}/>
              </Card>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Durée" subtitle={`${duration.hours}h${duration.minutes}m`} subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, margin: 10, marginTop: -1 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Temps de pause" subtitle={
                route.params.pauseTaken ? "45 minutes" : "20 minutes (obl.)"
              } subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Heures supp." subtitle={"0h"} subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, margin: 10, marginTop: -1 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Heures de nuits" subtitle={
                (parseInt(duration.nbrNights.hours) > 0 || parseInt(duration.nbrNights.minutes) > 0)
                  ? `${duration.nbrNights.hours}h${duration.nbrNights.minutes}m`
                  : "Aucune heure de nuit"
              } subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>
        </View> */}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold"
  }
});