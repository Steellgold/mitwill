import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement, useEffect } from "react";
import { View } from "react-native";
import { Card } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { dayJS } from "../../lib/dayjs/day-js";
import { calculateDiff, majdate } from "../../lib/dayjs/day-js.utils";
import type { Diff } from "../../lib/dayjs/day-js.types";

type Props = NativeStackScreenProps<RootStackParamList, "CheckInfoScreen">;

export const CheckInfoScreen = ({ route }: Props): ReactElement => {
  console.log(route.params.start, route.params.end);
  const duration: Diff = calculateDiff(route.params.start, route.params.end);

  return (
    <View style={{ padding: 15 }}>
      <Card>
        <Card.Title
          title={majdate(dayJS(route.params.date))}
          subtitle="Informations détaillées"
          subtitleStyle={{ marginTop: -5 }}
        />

        <View style={{ flexDirection: "row", gap: 10, margin: 10 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Début" subtitle={dayJS(route.params.start).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <Card>
              <Card.Title title="Fin" subtitle={dayJS(route.params.end).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
            </Card>
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
              <Card.Title title="Temps de pause" subtitle={"0 sur 45mins"} subtitleStyle={{ marginTop: -5 }}/>
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
        </View>
      </Card>
    </View>
  );
};