/* eslint-disable max-len */
import { useState, type ReactElement, useEffect } from "react";
import { Button, Checkbox, Dialog, Portal, SegmentedButtons, Text } from "react-native-paper";
import { TimePicker } from "react-native-paper-dates";
import type { Check } from "../../../../../../lib/providers/session";
import { dayJS } from "../../../../../../lib/dayjs/day-js";
import { addLeadingZero } from "../../../../../../lib/dayjs/day-js.utils";
import { View } from "react-native";

type Props = {
  visible: boolean;
  hideDialog: () => void;
  onDismiss: () => void;
  onConfirm: ({ start, end, needValidation }: { start: string; end: string; needValidation?: boolean }) => void;

  check: Check;
};

export const ConfirmCheckDialog = ({ visible, hideDialog, onDismiss, onConfirm, check }: Props): ReactElement => {
  const [value, setValue] = useState<"start" | "end">("start");
  const [needValidation, setNeedValidation] = useState(false);

  const [start, setStart] = useState<string>(dayJS(check.start).format("HH:mm:ss"));
  const [end, setEnd] = useState<string>(dayJS(check.end || new Date()).format("HH:mm:ss"));

  useEffect(() => {
    if (visible) setEnd(dayJS(new Date()).format("HH:mm:ss"));
  }, [visible]);

  console.log("aaaaa", { start, end });

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={false}>
        <Dialog.Icon icon="clock" />
        <Dialog.Title style={{ textAlign: "center", fontSize: 20 }}>Confirmer vos horaires</Dialog.Title>

        <Dialog.Content>
          <Text style={{ marginTop: 10 }}>
            <Text variant="bodySmall" style={{ fontWeight: "bold" }}>Heure de début : </Text>
            {dayJS(check.start).format("HH:mm:ss")}
          </Text>
          <Text>
            <Text variant="bodySmall" style={{ fontWeight: "bold" }}>Heure de fin : </Text>
            {dayJS(check.end || new Date()).format("HH:mm:ss")}
          </Text>

          <Text variant="bodySmall" style={{ marginTop: 10 }}>
            Si vous avez oublié de pointer à votre arrivée ou à votre départ, vous pouvez le faire ici en cliquant sur le bouton "Modifier mes horaires".
          </Text>

          <View style={{ marginTop: 15, marginBottom: 15 }}>
            <Checkbox.Item
              label="Modifier mes horaires"
              status={needValidation ? "checked" : "unchecked"}
              onPress={() => setNeedValidation(!needValidation)}
            />
          </View>


          {needValidation && (
            <>
              <SegmentedButtons
                value={value}
                onValueChange={(value) => setValue(value as "start" | "end")}
                style={{ marginBottom: 20 }}
                buttons={[
                  { value: "start", label: "Heure de début", icon: "clock-start", disabled: !needValidation },
                  { value: "end", label: "Heure de fin", icon: "clock-end", disabled: !needValidation }
                ]}
              />

              <TimePicker
                hours={parseInt(value === "start" ? start.split(":")[0] : end.split(":")[0])}
                minutes={parseInt(value === "start" ? start.split(":")[1] : end.split(":")[1])}
                inputType="keyboard"
                locale="fr"
                use24HourClock
                focused="hours"
                onFocusInput={() => console.log("onFocusInput")}
                inputFontSize={38}
                onChange={({ hours, minutes, focused }) => {
                  if (focused) return;
                  if (value === "start") {
                    setStart(`${addLeadingZero(hours)}:${addLeadingZero(minutes)}:00`);
                  } else {
                    setEnd(`${addLeadingZero(hours)}:${addLeadingZero(minutes)}:00`);
                  }
                }}
              />

              <Text variant="bodySmall" style={{ marginTop: 20 }}>Votre responsable sera notifié et devra les valider, mais ne vous inquiétez pas, vous pourrez pendant ce temps aller vérifier votre pointage sur l'accueil.</Text>
            </>
          )}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => {
            hideDialog();
          }}>Annuler</Button>
          <Button
            onPress={() => {
              onConfirm({ start, end, needValidation });
              hideDialog();
            }}>
            {needValidation ? "Envoyer pour validation" : "Confirmer"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};