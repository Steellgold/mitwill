import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement, useEffect } from "react";
import { Image, View } from "react-native";
import { Appbar, Badge, Text, Tooltip } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";
import { supabase } from "../db/supabase";
import { dayJS } from "../dayjs/day-js";

type Props = NativeStackScreenProps<RootStackParamList>;

export const AppBar = ({ navigation, route }: Props): ReactElement => {
  const { session, role } = useSession();

  if (!session && route.name === "LoginScreen" || !session && route.name === "RegisterScreen") {
    return (
      <Appbar>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
        <Appbar.Content title="" />
      </Appbar>
    );
  }

  const [waitingUsers, setWaitingUsers] = useState<number>(0);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async() => {
      if (role !== "MANAGER") return;
      const { data, error } = await supabase.rpc("count_users_waiting");
      if (error) console.error("Error:", error);
      else setWaitingUsers(data);
    }, 5000);

    return () => clearInterval(interval);
  }, [role]);

  return (
    <Appbar>
      {navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      {!navigation.canGoBack() && route.name !== "HomeScreen" && <Appbar.BackAction onPress={() => navigation.popToTop()} />}
      {!navigation.canGoBack() && <Text>{"    "}</Text>}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
      <Appbar.Content title="" />

      {/* <Tooltip title="Compteur" leaveTouchDelay={200} enterTouchDelay={200}>
        <Appbar.Action icon="numeric" onPress={() => {
          navigation.popToTop();
          navigation.push("CounterScreen");
        }} disabled={route.name === "CounterScreen"} />
      </Tooltip> */}

      {/* Todo, for now the app has only one little app-in-app */}
      {/* <Appbar.Action icon="apps" onPress={() => navigation.push("HomeScreen")} disabled={route.name === "HomeScreen"} /> */}

      <Tooltip title="Plannings" leaveTouchDelay={200} enterTouchDelay={200}>
        <Appbar.Action icon="calendar-month" onPress={() => navigation.push("PlanningScreen", {
          date: dayJS().format("YYYY-MM-DD")
        })} disabled={route.name === "PlanningScreen"} />
      </Tooltip>

      {role === "MANAGER" && (
        <View style={{ position: "relative" }}>
          <Tooltip title="Approbations" leaveTouchDelay={200} enterTouchDelay={200}>
            <Appbar.Action
              icon="stamper"
              onPress={() => navigation.push("ApprovalsScreen")}
              disabled={role !== "MANAGER"}
            />
          </Tooltip>
          {waitingUsers > 0 && <Badge style={{ position: "absolute", top: 0, right: 0 }} visible={true}>{waitingUsers}</Badge>}
        </View>
      )}

      <Tooltip title="Compte" leaveTouchDelay={200} enterTouchDelay={200}>
        <Appbar.Action icon={session ? "account" : "account-key"} disabled={
          !session && route.name === "LoginScreen"
        || session && route.name === "SessionScreen"
        || !session && route.name === "RegisterScreen"
        } onPress={() => {
          navigation.push(session ? "SessionScreen" : "LoginScreen");
        }} />
      </Tooltip>
    </Appbar>
  );
};