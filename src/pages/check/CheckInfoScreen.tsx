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

type MiniCardProps = {
  title: string;
  subtitle: string;
  long?: boolean;
  isTitle?: boolean;
};

export const MiniCard = ({ title, subtitle, long = false, isTitle = false }: MiniCardProps): ReactElement => {
  if (isTitle) {
    return (
      <Card.Title
        title={title}
        subtitle={subtitle}
        style={{ marginTop: 10 }}
        subtitleStyle={{ marginTop: -5 }}
        subtitleNumberOfLines={2}
      />
    );
  }

  return (
    <Card style={{ flex: long ? 2 : 1 }}>
      <Card.Title title={title} subtitle={subtitle} subtitleStyle={{ marginTop: -5 }}/>
    </Card>
  );
};

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
            <MiniCard
              title={`Pointage du ${dayJS(check.start).format("dddd DD MMMM YYYY")}`.replace(/(^\w{1})/g, letter => letter.toUpperCase())}
              subtitle={route.params.isManager
                ? "Données détaillées par rapport au pointage et au temps de travail de l'employé."
                : "Données détaillées par rapport à votre pointage et votre temps de travail."}
              isTitle
            />

            <View style={{ marginVertical: 5 }} />

            <Card.Content>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <MiniCard title="Début de journée" subtitle={dayJS(check.start).format("HH[h]mm[m]")} />
                <MiniCard title={
                  `Fin ${dayJS(check.start).isSame(dayJS(check.end), "day") ? "de journée" : "le lendemain"}`
                } subtitle={dayJS(check.end).format("HH[h]mm[m]")} />
              </View>

              <View style={{ marginVertical: 5 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                {(parseInt(duration.nbrNights.hours) > 0) || (parseInt(duration.nbrNights.minutes) > 0) ? (
                  <MiniCard title="Heures en nuit" subtitle={`${duration.nbrNights.hours} heures et ${duration.nbrNights.minutes} mins`} />
                ) : (
                  <MiniCard title="Heures en nuit" subtitle="Aucune" />
                )}

                {(parseInt(duration.nbrSupps.hours) > 0) || (parseInt(duration.nbrSupps.minutes) > 0)
                  ? <MiniCard title="Heures supps." subtitle={`${duration.nbrSupps.hours} heures et ${duration.nbrSupps.minutes} mins`} />
                  : <MiniCard title="Heures supps." subtitle="Aucune" />}
              </View>

              <View style={{ paddingVertical: 10, flexDirection: "column", gap: 5 }}>
                <View style={{ flexDirection: "row", gap: 3, alignItems: "center", flex: 1 }}>
                  <Avatar.Icon color="#785E2F" size={24} icon="coffee" style={{ backgroundColor: "transparent" }}/>
                  <Text style={styles.orange}>Une pause de {check.pauseTaken ? "45" : "20"} mins a été prise.</Text>
                </View>
              </View>

              <Divider style={{ marginBottom: 15 }} />

              <MiniCard
                title="Temps de travail (sans la pause)"
                subtitle={`${duration.workTime.hours} heures et ${duration.workTime.minutes} mins`}
                long
              />
            </Card.Content>

            <View style={{ marginVertical: 10 }} />
          </Card>

          <View style={{ marginVertical: 10 }} />

          <Text style={styles.bold}>Remarque:</Text>
          <Text>Votre temps de travail est calculé en fonction de votre heure d'arrivée et de votre heure de départ. Si vous avez pris une pause, elle est déduite de votre temps de travail.</Text>

          <View style={{ marginVertical: 10 }}/>

          <Text style={styles.bold}>Note:</Text>
          <Text>- Les heures de nuit sont calculées entre 21h30 et 6h00.</Text>
          {check.pause !== "NONE"
            && <Text>- Les heures supplémentaires sont calculées au-delà de 7h{check.pauseTaken ? "45" : "20"} de travail.</Text>}

          {check.pause === "NONE" && (
            <>
              <View style={{ marginVertical: 10 }}/>

              <Text style={styles.red}>** Les pauses par défaut (20 mins) dans des journées inférieures à 6h ne sont pas prises en compte.</Text>
            </>
          )}
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
    color: "#785E2F"
  },
  red: {
    color: "#fd4646"
  }
});