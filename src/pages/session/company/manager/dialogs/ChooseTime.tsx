import { useState, type ReactElement } from "react";
import { Button, Dialog, Portal, SegmentedButtons, Text } from "react-native-paper";
import { View } from "react-native";
import { TimePicker } from "react-native-paper-dates";
import type { Dayjs } from "../../../../../lib/dayjs/day-js";
import { dayJS } from "../../../../../lib/dayjs/day-js";

type Props = {
  visible: boolean;
  hideDialog: () => void;
  onDismiss: () => void;
  onConfirm: ({ start, end }: { start: string; end: string }) => void;

  forAllDays: boolean;
  date?: Dayjs | null;
};

export const ChooseTimeDialog = ({ visible, hideDialog, onDismiss, onConfirm, forAllDays = true, date = null }: Props): ReactElement => {
  const currentTime = dayJS();
  const currentTimePlusTwo = currentTime.add(7, "hour").add(45, "minute");

  const [start, setStart] = useState<string>(currentTime.format("HH:mm:00"));
  const [end, setEnd] = useState<string>(currentTimePlusTwo.format("HH:mm:00"));

  const [error, setError] = useState<string>("");
  const [value, setValue] = useState<string>("start");

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="clock" />
        <Dialog.Title>Choisir la plage horaire</Dialog.Title>

        <Dialog.Content>
          {forAllDays ? (
            <Text>Les horaires choisis s'appliqueront à tous les jours de la semaine, qui sont affichés ci-dessous (en dehors du dialogue)</Text>
          ) : (
            <Text>Les horaires choisis s'appliqueront uniquement pour ce jour ({dayJS(date).format("dddd DD/MM")})</Text>
          )}

          {error && <Text variant="bodySmall" style={{ color: "red" }}>{error}</Text>}
          <View style={{ marginBottom: 10 }} />

          <SegmentedButtons
            value={value}
            onValueChange={(value) => setValue(value)}
            style={{ marginBottom: 50 }}
            buttons={[
              { value: "start", label: "Heure de début", icon: "clock-start" },
              { value: "end", label: "Heure de fin", icon: "clock-end" }
            ]}
          />

          <TimePicker
            hours={parseInt(start.split(":")[0])}
            minutes={parseInt(start.split(":")[1])}
            inputType="keyboard"
            locale="fr"
            use24HourClock
            focused="hours"
            onFocusInput={() => console.log("onFocusInput")}
            inputFontSize={38}
            onChange={(time) => {
              if (value == "start") setStart(`${time.hours}:${time.minutes}:00`);
              else setEnd(`${time.hours}:${time.minutes}:00`);
            }}
          />

        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => {
            hideDialog();
            setError("");
          }}>Annuler</Button>
          <Button
            onPress={() => onConfirm({ start, end })}
            disabled={error !== ""}>Confirmer
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};