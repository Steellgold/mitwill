import { useState, type ReactElement, useEffect } from "react";
import { View, Vibration } from "react-native";
import { Avatar, Button, Dialog, Portal, Text, TextInput, TouchableRipple } from "react-native-paper";

export const CounterScreen = (): ReactElement => {
  const [counter, setCounter] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [delay, setDelay] = useState(50);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogValue, setDialogValue] = useState<string>("0");

  const clearIncrementInterval = (): void => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setDelay(50);
    }
  };

  const startIncrementInterval = (action: "increment" | "decrement" = "increment"): void => {
    clearIncrementInterval();
    const id = setInterval(() => {
      setCounter((prevCounter) => {
        if (action === "increment") {
          Vibration.vibrate(10);
          return prevCounter + 1;
        } else if (action === "decrement" && prevCounter > 0) {
          Vibration.vibrate(10);
          return prevCounter - 1;
        } else {
          return prevCounter;
        }
      });
      setDelay((prevDelay) => Math.max(50, prevDelay - 50));
    }, delay);
    setIntervalId(id);
  };

  useEffect(() => {
    if (intervalId) {
      clearIncrementInterval();
      startIncrementInterval();
    }
  }, [delay]);

  useEffect(() => {
    return () => clearIncrementInterval();
  }, []);

  return (
    <View style={{ flexDirection: "row", height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Icon icon="numeric" />
          <Dialog.Title>Modifier le compteur</Dialog.Title>

          <Dialog.Content>
            <TextInput
              keyboardType="numeric"
              label="Modifier le compteur"
              value={dialogValue.toString()}
              onChangeText={(text) => setDialogValue(text)}
            />
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => {
              setCounter(parseInt(dialogValue, 10));
              setIsDialogVisible(false);
            }}>Annuler</Button>

            <Button onPress={() => {
              setCounter(parseInt(dialogValue, 10));
              setDialogValue("0");
              setIsDialogVisible(false);
            }}>Valider</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <TouchableRipple
        onPress={() => {
          if (counter > 0) {
            Vibration.vibrate(10);
            setCounter(counter - 1);
          } else {
            Vibration.vibrate(100);
          }
        }}
        onLongPress={() => startIncrementInterval("decrement")}
        onPressOut={clearIncrementInterval}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", zIndex: 1 }}
        disabled={counter <= 0}
      >
        <Text style={{ fontSize: 20, opacity: counter <= 0 ? 0.5 : 1 }}>-1</Text>
      </TouchableRipple>

      <View style={{ position: "absolute", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
        <TouchableRipple
          style={{ borderRadius: 9999 }}
          onPress={() => setIsDialogVisible(true)}
          onLongPress={() => setCounter(0)}
          borderless
        >
          <Avatar.Text
            size={100}
            labelStyle={{ fontSize: 30, color: "white" }}
            style={{ backgroundColor: "#fd7e46" }}
            label={counter.toString()}
          >
          </Avatar.Text>
        </TouchableRipple>
      </View>

      <TouchableRipple
        onPress={() => {
          Vibration.vibrate(10);
          setCounter(counter + 1);
        }}
        onLongPress={() => startIncrementInterval("increment")}
        onPressOut={clearIncrementInterval}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", zIndex: 1 }}
      >
        <Text style={{ fontSize: 20 }}>+1</Text>
      </TouchableRipple>
    </View>
  );
};