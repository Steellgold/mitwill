import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReactElement } from "react";
import { Image } from "react-native";
import { Appbar, Text } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";

type Props = NativeStackScreenProps<RootStackParamList>;

export const AppBar = ({ navigation, route }: Props): ReactElement => {
  const { session } = useSession();

  if (!session && route.name === "LoginScreen" || !session && route.name === "RegisterScreen") {
    return (
      <Appbar>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
        <Appbar.Content title="" />
      </Appbar>
    );
  }

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
      }} />

      <Appbar.Action icon="calendar-month" onPress={() => navigation.push("CalendarScreen")} disabled />

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