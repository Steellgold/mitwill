import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReactElement } from "react";
import { Image } from "react-native";
import { Appbar } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";

type Props = NativeStackScreenProps<RootStackParamList>;

export const AppBar = ({ navigation, route }: Props): ReactElement => {
  const { logout, session } = useSession();

  if (!session && route.name === "LoginScreen" || !session && route.name === "RegisterScreen") {
    return (
      <Appbar>
        {navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
        <Appbar.Content title="" />
      </Appbar>
    );
  }

  return (
    <Appbar>
      {navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image source={require("./assets/logo.jpg")} style={{ width: 100, height: 40 }} />
      <Appbar.Content title="" />

      <Appbar.Action icon="numeric" onPress={() => {
        console.log("Pressed numeric");
        navigation.navigate("CounterScreen");
      }}/>

      <Appbar.Action icon="calendar-month" onPress={() => {
        console.log("Pressed calendar");
        navigation.navigate("CalendarScreen");
      }}/>

      <Appbar.Action icon={session ? "account" : "account-key"} disabled={
        !session && route.name === "LoginScreen"
        || session && route.name === "SessionScreen"
        || !session && route.name === "RegisterScreen"
      } onPress={() => {
        console.log("Pressed account");
        navigation.navigate(session ? "SessionScreen" : "LoginScreen");
      }} />

      {session && <Appbar.Action icon="logout" onPress={() => {
        console.log("Pressed logout");
        logout()
          .then(() => navigation.navigate("LoginScreen"))
          .catch((error) => console.error("Error:", error));
      }}/>}
    </Appbar>
  );
};