/* eslint-disable max-len */
import { Button, Dialog, FAB, Portal, Text } from "react-native-paper";
import { useSession } from "../../hooks/useSession";
import { useState, type ReactElement } from "react";
import { StyleSheet } from "react-native";
import { dayJS } from "../../dayjs/day-js";

type Props = {
  visible: boolean;
};

export const CheckFAB = ({ visible }: Props): ReactElement => {
  const { session, activeCheck, startCheck, endCheck, checks } = useSession();
  const [fabGroupOpen, setFabGroupOpen] = useState(false);
  const [dialogPauseVisible, setDialogPauseVisible] = useState(false);

  if (activeCheck) {
    return (
      <Portal>
        <Dialog
          visible={dialogPauseVisible}
          onDismiss={() => setDialogPauseVisible(false)}
        >
          <Dialog.Icon icon="coffee" />
          <Dialog.Title style={styles.title}>Prise de pause</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ marginBottom: 10 }}>
              Seules 20 minutes de pause sont automatiquement reconnues. Pour une pause plus longue, comme 45 minutes pour manger, veuillez confirmer en cliquant sur 'Confirmer'.
            </Text>

            <Text
              style={{ color: "#fd4646" }}
              variant="bodySmall"
            >
                En cliquant sur "Confirmer", vous confirmez que vous avez pris une pause de 45 minutes.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogPauseVisible(false)}>Confirmer</Button>
          </Dialog.Actions>
        </Dialog>

        <FAB.Group
          open={fabGroupOpen}
          onStateChange={({ open }) => setFabGroupOpen(open)}
          icon={"clock-edit-outline"}
          label="Gérer ma journée"
          visible={visible}
          style={styles.fabGroup}
          actions={[
            {
              icon: "clock-remove-outline",
              label: "Terminer ma journée",
              onPress: () => {
                endCheck()
                  .then(() => console.log("Check ended"))
                  .catch((error) => console.error("Error (CheckFAB.tsx l31):", error));
                console.log("FAB pressed", session?.user.user_metadata);
              }
            },
            {
              icon: "coffee-outline",
              label: "Pause (45 min)",
              onPress: () => setDialogPauseVisible(true)
            }
          ]}
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
        disabled={!session || activeCheck || checks.some((check) => check.date === dayJS().format("YYYY-MM-DD"))}
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