/* eslint-disable max-len */
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type  { ReactElement } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Divider, Text } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { dayJS } from "../../lib/dayjs/day-js";
import { calculate } from "../../lib/dayjs/day-js.utils";
import type { DiffWithWT } from "../../lib/dayjs/day-js.types";

type Props = NativeStackScreenProps<RootStackParamList, "CheckInfoScreen">;

export const CheckInfoScreen = ({ route }: Props): ReactElement => {
  if (!route.params) {
    return <View />;
  }

  const check = route.params.check;
  const duration: DiffWithWT = calculate(route.params.check);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <Card>
            <Card.Title
              style={{ marginTop: 10 }}
              title="Pointage du jour"
              subtitle={route.params.isManager
                ? "Données détaillées par rapport au pointage et au temps de travail de l'employé."
                : "Données détaillées par rapport à votre pointage et votre temps de travail."}
              subtitleNumberOfLines={2}
              subtitleStyle={{ marginTop: -5 }}
            />

            <View style={{ marginVertical: 5 }} />

            <Card.Content>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Card style={{ flex: 1 }}>
                  <Card.Title
                    title="Début de journée"
                    subtitle={dayJS(check.start).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
                </Card>

                <Card style={{ flex: 1 }}>
                  <Card.Title
                    title="Fin de journée"
                    subtitle={dayJS(check.end).format("HH[h]mm[m]")} subtitleStyle={{ marginTop: -5 }}/>
                </Card>
              </View>

              <View style={{ marginVertical: 5 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Card style={{ flex: 1 }}>
                  <Card.Title
                    title="Heures travaillées"
                    subtitle={`${duration.hours} heures et ${duration.minutes} mins`} subtitleStyle={{ marginTop: -5 }}/>
                </Card>

                <Card style={{ flex: 1 }}>
                  <Card.Title
                    title="Pause"
                    subtitle={
                      check.pauseTaken
                        ? "45 mins"
                        : "20 mins (oblg.)"
                    } subtitleStyle={{ marginTop: -5 }}/>
                </Card>
              </View>

              <View style={{ marginVertical: 5 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                {(parseInt(duration.nbrNights.hours) > 0) || (parseInt(duration.nbrNights.minutes) > 0) ? (
                  <Card style={{ flex: 1 }}>
                    <Card.Title
                      title="Heures de nuit"
                      subtitle={`${duration.nbrNights.hours} heures et ${duration.nbrNights.minutes} mins`} subtitleStyle={{ marginTop: -5 }}/>
                  </Card>
                ) : (
                  <Card style={{ flex: 1 }} disabled>
                    <Card.Title title="Heures de nuit" subtitle="Aucune" subtitleStyle={{ marginTop: -5 }}/>
                  </Card>
                )}

                {(parseInt(duration.nbrSupps.hours) > 0) || (parseInt(duration.nbrSupps.minutes) > 0) ? (
                  <Card style={{ flex: 1 }}>
                    <Card.Title
                      title="Heures supps."
                      subtitle={`${duration.nbrSupps.hours} heures et ${duration.nbrSupps.minutes} mins`} subtitleStyle={{ marginTop: -5 }}/>
                  </Card>
                ) : (
                  <Card style={{ flex: 1 }} disabled>
                    <Card.Title title="Heures supps." subtitle="Aucune" subtitleStyle={{ marginTop: -5 }}/>
                  </Card>
                )}
              </View>

              <Divider style={{ marginVertical: 15 }} />

              <Card>
                <Card.Title
                  title="Temps de travail (sans la pause)"
                  subtitle={`${duration.workTime.hours} heures et ${duration.workTime.minutes} mins`}
                  subtitleStyle={{ marginTop: -5 }}
                />
              </Card>
            </Card.Content>

            <Divider style={{ marginTop: 15, marginBottom: 5 }}/>

            <View style={{ padding: 10, flexDirection: "column", gap: 5 }}>
              <View style={{ flexDirection: "row", gap: 3, alignItems: "center", flex: 1 }}>
                <Avatar.Icon color="#fd7e46" size={24} icon="information" style={{ backgroundColor: "transparent" }}/>
                <Text style={styles.orange}>Ces informations sont visibles par votre employeur.</Text>
              </View>
            </View>
          </Card>

          <View style={{ marginVertical: 10 }} />

          <Text style={styles.bold}>Remarque:</Text>
          <Text>Votre temps de travail est calculé en fonction de votre heure d'arrivée et de votre heure de départ. Si vous avez pris une pause, elle est déduite de votre temps de travail.</Text>

          <View style={{ marginVertical: 10 }}/>

          <Text style={styles.bold}>Note:</Text>
          <Text>- Les heures de nuit sont calculées entre 21h30 et 6h00.</Text>
          <Text>- Les heures supplémentaires sont calculées au-delà de 7h{check.pauseTaken ? "45" : "20"} de travail.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold"
  },
  orange: {
    color: "#fd7e46"
  },
  red: {
    color: "#fd4646"
  }
});