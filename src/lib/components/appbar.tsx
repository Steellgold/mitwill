import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement } from "react";
import { Image } from "react-native";
import { Appbar, Avatar, Menu } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";
import { getAvatar } from "../dicebear";

type Props = NativeStackScreenProps<RootStackParamList>;

export const AppBar = ({ navigation, route }: Props): ReactElement => {
  const { logout, session } = useSession();
  const [menuVisible, setMenuVisible] = useState(false);

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

      <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
        anchor={<Avatar.Image source={{ uri: getAvatar(session?.user.email) }} size={40} />}>
        <Menu.Item onPress={() => {
          console.log("Pressed account");
          navigation.navigate(session ? "SessionScreen" : "LoginScreen");
        }} title={session ? "Account" : "Login"} trailingIcon={session ? "account" : "account-key"} />

        {session && <Menu.Item onPress={() => {
          console.log("Pressed logout");
          logout()
            .then(() => navigation.navigate("LoginScreen"))
            .catch((error) => console.error("Error:", error));
        }} title="Logout" trailingIcon={"logout"} />}
      </Menu>
    </Appbar>
  );
};