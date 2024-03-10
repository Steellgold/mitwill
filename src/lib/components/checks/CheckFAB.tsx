/* eslint-disable max-len */
import { Button, Dialog, FAB, Portal, Text } from "react-native-paper";
import { useSession } from "../../hooks/useSession";
import { useState, type ReactElement } from "react";
import type { Animated, ColorValue, GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { dayJS } from "../../dayjs/day-js";
import type { IconSource } from "react-native-paper/lib/typescript/components/Icon";

type Props = {
  visible: boolean;
};

type Action = {
  icon: IconSource;
  label?: string;
  color?: string;
  labelTextColor?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  containerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  labelStyle?: StyleProp<TextStyle>;
  labelMaxFontSizeMultiplier?: number;
  onPress: (e: GestureResponderEvent) => void;
  size?: "small" | "medium";
  testID?: string;
  rippleColor?: ColorValue;
}

export const CheckFAB = ({ visible }: Props): ReactElement => {
  const { session, activeCheck, startCheck, endCheck, checks, setPauseTaken } = useSession();
  const [fabGroupOpen, setFabGroupOpen] = useState(false);
  const [dialogPauseVisible, setDialogPauseVisible] = useState(false);

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
            <Button onPress={() => setDialogPauseVisible(false)}>Annuler</Button>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button onPress={async() => {
              await setPauseTaken(true);
              setDialogPauseVisible(false);
            }}>Confirmer</Button>
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
          ] as Action[]}
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
          || checks.some((check) => check.date === dayJS().format("YYYY-MM-DD"))
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