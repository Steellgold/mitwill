import React from "react";
import type { ReactElement } from "react";
import { AppBar } from "./src/lib/components/appbar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/pages/HomeScreen";
import { CounterScreen } from "./src/pages/CounterScreen";
import { CalendarScreen } from "./src/pages/CalendarScreen";
import { LoginScreen } from "./src/pages/session/LoginScreen";
import { SessionScreen } from "./src/pages/session/SessionScreen";
import { RegisterScreen } from "./src/pages/session/RegisterScreen";
import { CheckInfoScreen } from "./src/pages/check/CheckInfoScreen";
import { useSession } from "./src/lib/hooks/useSession";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { ApprovalsScreen } from "./src/pages/session/company/ApprovalsScreen";
import type { Check } from "./src/lib/providers/session";

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  HomeScreen: undefined;
  CounterScreen: undefined;
  CalendarScreen: undefined;

  // Session screens
  LoginScreen: undefined;
  RegisterScreen: undefined;
  SessionScreen: undefined;

  CheckInfoScreen: Check;

  // Manage screens
  ApprovalsScreen: undefined;
};

export const App = (): ReactElement => {
  const { logoutLoading, appLoading, status, refresh, refreshing, session } = useSession();
  if (appLoading || logoutLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 3, backgroundColor: "#fffbfe" }}>
        <ActivityIndicator size={"large"} style={{ marginBottom: 10 }} color="#fd7e47" />
        {
          logoutLoading
            ? <Text>Déconnexion en cours...</Text>
            : <Text>Chargement de l'application...</Text>
        }
      </View>
    );
  }

  if (session && status === "WAITING" || status === "DECLINED") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 3, padding: 20, backgroundColor: "#fffbfe" }}>
        {
          status === "WAITING"
            ? <Text style={{ textAlign: "center" }}>Votre compte est en attente de validation, veuillez patienter</Text>
            : <Text style={{ textAlign: "center" }}>
              Votre compte a été refusé, veuillez contacter un administrateur ou votre reponsable si vous pensez qu'il s'agit d'une erreur</Text>
        }

        <Button
          mode="contained-tonal"
          onPress={() => {
            if (refreshing) return;
            refresh?.();
          }}
          icon="refresh"
          loading={refreshing}
          style={{ marginTop: 10 }}
        >
          Rafraîchir
        </Button>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
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

      <Stack.Screen name="CheckInfoScreen" component={CheckInfoScreen} />

      {/* Manage screens */}
      <Stack.Screen name="ApprovalsScreen" component={ApprovalsScreen} />
    </Stack.Navigator>
  );
};