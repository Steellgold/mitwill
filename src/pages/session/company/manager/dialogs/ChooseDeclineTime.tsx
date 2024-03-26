import { useState, type ReactElement } from "react";
import { Button, Dialog, Portal, SegmentedButtons } from "react-native-paper";
import { TimePicker } from "react-native-paper-dates";
import type { Database } from "../../../../../lib/db/supabase.types";
import { dayJS } from "../../../../../lib/dayjs/day-js";
import { View } from "react-native";

type Props = {
  visible: boolean;
  hideDialog: () => void;
  onDismiss: () => void;
  onConfirm: ({ start, end }: { start: string; end: string }) => void;

  startAt: string;
  endAt: string;

  check: Database["public"]["Tables"]["checks"]["Row"];
};

export const ChooseDeclineTimeDialog = ({ visible, hideDialog, onDismiss, onConfirm, startAt, endAt, check }: Props): ReactElement => {
  const [start, setStart] = useState<string>(startAt);
  const [end, setEnd] = useState<string>(endAt);

  const [value, setValue] = useState<string>("start");

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} onDismiss={onDismiss}>
        <Dialog.Content>
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
            hours={value === "start" ? parseInt(start.split(":")[0]) : parseInt(end.split(":")[0])}
            minutes={value === "start" ? parseInt(start.split(":")[1]) : parseInt(end.split(":")[1])}
            inputType="keyboard"
            locale="fr"
            use24HourClock
            focused="hours"
            onFocusInput={() => console.log("onFocusInput")}
            inputFontSize={38}
            onChange={(time) => {
              if (value === "start") {
                setStart(`${time.hours}:${time.minutes}:${start.split(":")[2]}`);
              } else {
                setEnd(`${time.hours}:${time.minutes}:${end.split(":")[2]}`);
              }
            }}
          />

        </Dialog.Content>

        <Dialog.Actions style={{ justifyContent: "space-between" }}>
          <Button
            icon="refresh"
            mode="contained-tonal"
            onPress={() => {
              setValue("start");
              setStart(dayJS(check.start).format("HH:mm:ss"));
              setEnd(dayJS(check.end).format("HH:mm:ss") || "");
            }}>Remettre l'original</Button>

          <View style={{ flexDirection: "row" }}>
            <Button onPress={() => {
              hideDialog();
              setStart(startAt);
              setEnd(endAt);
              setValue("start");
            }}>Annuler</Button>

            <Button
              disabled={start === startAt && end === endAt}
              onPress={() => onConfirm({ start, end })}
            >Modifier</Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};