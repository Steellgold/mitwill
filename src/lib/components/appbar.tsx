import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement } from "react";
import { Image, View } from "react-native";
import { Appbar, Badge, Text } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";
import { useAsync } from "../hooks/useAsync";
import { supabase } from "../db/supabase";

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
  useAsync(async() => {
    if (role !== "MANAGER") return;
    const { data, error } = await supabase
      .rpc("count_users_waiting");
    if (error) console.error("Error:", error);
    else setWaitingUsers(data);
  }, [role]);

  return (
    <Appbar>
      {navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      {!navigation.canGoBack() && <Text>{"    "}</Text>}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
      <Appbar.Content title="" />

      <Appbar.Action icon="numeric" onPress={() => {
        navigation.popToTop();
        navigation.push("CounterScreen");
      }} disabled={route.name === "CounterScreen"} />

      <Appbar.Action icon="calendar-month" onPress={() => navigation.push("CalendarScreen")} disabled />

      {role === "MANAGER" && (
        <View style={{ position: "relative" }}>
          <Appbar.Action
            icon="stamper"
            onPress={() => navigation.push("ApprovalsScreen")}
            disabled={role !== "MANAGER"}
          />
          {waitingUsers > 0 && <Badge style={{ position: "absolute", top: 0, right: 0 }} visible={true}>{waitingUsers}</Badge>}
        </View>
      )}

      <Appbar.Action icon={session ? "account" : "account-key"} disabled={
        !session && route.name === "LoginScreen"
        || session && route.name === "SessionScreen"
        || !session && route.name === "RegisterScreen"
      } onPress={() => {
        navigation.push(session ? "SessionScreen" : "LoginScreen");
      }} />
    </Appbar>
  );
};