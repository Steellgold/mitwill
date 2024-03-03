import React from "react";
import type { ReactElement } from "react";
import { AppBar } from "./src/lib/components/appbar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/pages/HomeScreen";
import { CounterScreen } from "./src/pages/CounterScreen";
import { CalendarScreen } from "./src/pages/CalendarScreen";
import { useSession } from "./src/lib/hooks/useSession";
import { LoginScreen } from "./src/pages/session/LoginScreen";
import { SessionScreen } from "./src/pages/session/SessionScreen";
import { RegisterScreen } from "./src/pages/session/RegisterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  HomeScreen: undefined;
  CounterScreen: undefined;
  CalendarScreen: undefined;

  // Session screens
  LoginScreen: undefined;
  RegisterScreen: undefined;
  SessionScreen: undefined;
};

export const App = (): ReactElement => {
  const session = useSession();
  console.log("Session", session);

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fffbfe"
        },
        animation: "none",
        // @ts-ignore
        header: (props) => <AppBar {...props} />
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CounterScreen" component={CounterScreen} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />

      {/* Session screens */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="SessionScreen" component={SessionScreen} />

    </Stack.Navigator>
  );
};