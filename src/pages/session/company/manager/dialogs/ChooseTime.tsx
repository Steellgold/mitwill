import { useState, type ReactElement } from "react";
import { Button, Dialog, Portal, SegmentedButtons, Text } from "react-native-paper";
import { View } from "react-native";
import { TimePicker } from "react-native-paper-dates";
import { dayJS } from "../../../../../lib/dayjs/day-js";

type Props = {
  visible: boolean;

  date: string;
  isNightWeek: boolean;

  hideDialog: () => void;
  onDismiss: () => void;
  onConfirm: ({ startH, startM, endH, endM }: { startH: number; startM: number; endH: number; endM: number }) => void;
};

export const ChooseTimeDialog = ({ visible, hideDialog, onDismiss, onConfirm, date, isNightWeek }: Props): ReactElement => {
  const currentTime = dayJS();
  const currentTimePlusTwo = currentTime.add(2, "hour");

  const [startH, startHSet] = useState<number>(currentTime.hour());
  const [startM, startMSet] = useState<number>(currentTime.minute());

  const [endH, endHSet] = useState<number>(currentTimePlusTwo.hour());
  const [endM, endMSet] = useState<number>(currentTimePlusTwo.minute());

  const [error, setError] = useState<string>("");
  const [value, setValue] = useState<string>("start");

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="clock" />
        <Dialog.Title>Choisir la plage horaire</Dialog.Title>

        <Dialog.Content>
          {isNightWeek ? (<Text>Vous avez choisi une semaine de nuit, l'heure de fin sera le lendemain de l'heure de début</Text>
          ) : <Text>Choisissez l'heure de début et de fin pour le {dayJS(date).format("dddd DD/MM")}</Text>}
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
            hours={value === "start" ? startH : endH}
            minutes={value === "start" ? startM : endM}
            inputType="keyboard"
            locale="fr"
            use24HourClock
            focused="hours"
            onFocusInput={() => console.log("onFocusInput")}
            inputFontSize={38}
            onChange={(time) => {
              if (value === "start") {
                startHSet(time.hours);
                startMSet(time.minutes);
                if (endH < time.hours || (endH === time.hours && endM < time.minutes)) {
                  setError("L'heure de début doit être avant l'heure de fin");
                } else {
                  setError("");
                }
              } else {
                endHSet(time.hours);
                endMSet(time.minutes);
                if (time.hours < startH || (time.hours === startH && time.minutes < startM)) {
                  setError("L'heure de fin doit être après l'heure de début");
                } else {
                  setError("");
                }
              }
            }}
          />

        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => {
            hideDialog();
            setError("");
          }}>Annuler</Button>
          <Button
            onPress={() => onConfirm({ startH, startM, endH, endM })}
            disabled={error !== ""}
          >Confirmer
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};