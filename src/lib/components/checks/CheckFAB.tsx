/* eslint-disable camelcase */
/* eslint-disable max-len */
import { Avatar, Button, Card, Dialog, FAB, Portal, Text } from "react-native-paper";
import { useSession } from "../../hooks/useSession";
import { useState, type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { dayJS } from "../../dayjs/day-js";
import { ConfirmCheckDialog } from "../../../pages/session/company/manager/dialogs/check/ConfirmCheck";
import { supabase } from "../../db/supabase";
import { OPEN_CHECKS } from "../../../../codes";
import { fullName } from "../../some";
import type { FABGroupActions } from "../../types/fab";
import { isBeyond45minutes } from "../../dayjs/day-js.utils";

type Props = {
  visible: boolean;
};

export const CheckFAB = ({ visible }: Props): ReactElement => {
  const { session, activeCheck, startCheck, endCheck, setPauseTaken } = useSession();
  const [fabGroupOpen, setFabGroupOpen] = useState(false);
  const [dialogPauseVisible, setDialogPauseVisible] = useState(false);

  const [dialogCheckVisible, setDialogCheckVisible] = useState(false);

  const isSunday = dayJS().day() === 0;

  if (activeCheck) {
    return (
      <Portal>
        <Dialog
          visible={dialogPauseVisible && !activeCheck.pauseTaken}
          onDismiss={() => setDialogPauseVisible(false)}
        >
          <Dialog.Icon icon="coffee" />
          <Dialog.Title style={styles.title}>Prise de pause</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 10 }}>Avez vous pris une pause à plus de 20 minutes aujourd'hui ?</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Avatar.Icon size={24} icon="information" />
              <Text variant="bodySmall" style={{ flexDirection: "row", alignItems: "center" }}>
              Si vous cliquez sur "Oui", l'action est irréversible.
              </Text>
            </View>

            {!isBeyond45minutes(activeCheck.start, dayJS()) && (
              <Card style={{ backgroundColor: "#e94e4e", marginTop: 10 }}>
                <Card.Content style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ color: "#fff" }}>Vous ne pouvez pas prendre de pause de 45 minutes avant 45 minutes de travail 😅</Text>
                </Card.Content>
              </Card>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogPauseVisible(false)}>Annuler</Button>
            <Button
              disabled={!isBeyond45minutes(activeCheck.start, dayJS())}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={async() => {
                await setPauseTaken(true);
                setDialogPauseVisible(false);
              }}>Oui</Button>
          </Dialog.Actions>
        </Dialog>

        <ConfirmCheckDialog
          check={activeCheck}
          visible={dialogCheckVisible}
          hideDialog={() => setDialogCheckVisible(false)}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onConfirm={async({ start, end, needValidation }): Promise<void> => {
            const Vstart = dayJS().format("YYYY-MM-DD") + "T" + start;
            const Vend = dayJS().format("YYYY-MM-DD") + "T" + end;

            endCheck(needValidation, needValidation ? Vstart : "", needValidation ? Vend : "")
              .then(() => console.log("Check ended"))
              .catch((error) => console.error("Error:", error));

            if (needValidation) {
              await supabase
                .functions
                .invoke("get_approbator")
                .then(async(response) => {
                  await supabase
                    .functions
                    .invoke("push", {
                      body: {
                        record: {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          user_id: response.data.userId || "",
                          title: "Validation de pointage",
                          body: `Un pointage a été effectué par ${fullName(session?.user.user_metadata)} et a besoin d'être validé.`,
                          action: OPEN_CHECKS
                        }
                      }
                    })
                    .then(() => console.log("Notification sent!"))
                    .catch((error) => console.error("Error (handleRegister in RegisterScreen.tsx l39):", error));
                })
                .catch((error) => {
                  console.error("Error (handleRegister in RegisterScreen.tsx l39):", error);
                });
            }
          }}
          onDismiss={() => setDialogCheckVisible(false)}
        />

        <FAB.Group
          open={fabGroupOpen}
          onStateChange={({ open }) => setFabGroupOpen(open)}
          icon={"clock-edit-outline"}
          label="Gérer ma journée"
          visible={!dialogPauseVisible}
          style={styles.fabGroup}
          actions={[
            {
              icon: "clock-remove-outline",
              label: "Terminer ma journée",
              onPress: () => {
                setDialogCheckVisible(true);
              }
            },
            {
              icon: "coffee-outline",
              label: activeCheck.pauseTaken ? "Pause déjà prise" : "Prendre une pause de 45 minutes",
              labelStyle: {
                opacity: activeCheck.pauseTaken ? 0.5 : 1
              },
              style: {
                opacity:
                  activeCheck.pauseTaken ? fabGroupOpen ? 0.5 : 0 : fabGroupOpen ? 1 : 0

              },
              onPress: () => setDialogPauseVisible(true)
            }
          ] as FABGroupActions[]}
        />
      </Portal>
    );
  }

  return (
    <Portal>
      <FAB
        style={styles.fab}
        visible={visible}
        icon="clock-outline"
        label="Démarrer ma journée"
        disabled={
          !session
          || activeCheck
          || isSunday
        }
        onPress={() => {
          console.log("FAB pressed", session?.user.user_metadata);
          startCheck()
            .then(() => console.log("Check started"))
            .catch((error) => console.error("Error (CheckFAB.tsx l51):", error));
        }}
      />
    </Portal>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0
  },
  fabGroup: {
    position: "absolute",
    right: 0,
    bottom: 0
  },
  title: {
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  }
});