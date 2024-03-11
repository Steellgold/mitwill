/* eslint-disable camelcase */
import React, { useState } from "react";
import type { ReactElement } from "react";
import { AppBar } from "./src/lib/components/appbar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/pages/HomeScreen";
import { CounterScreen } from "./src/pages/CounterScreen";
import { LoginScreen } from "./src/pages/session/LoginScreen";
import { SessionScreen } from "./src/pages/session/SessionScreen";
import { RegisterScreen } from "./src/pages/session/RegisterScreen";
import { CheckInfoScreen } from "./src/pages/check/CheckInfoScreen";
import { useSession } from "./src/lib/hooks/useSession";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { ApprovalsScreen } from "./src/pages/session/company/ApprovalsScreen";
import type { Check } from "./src/lib/providers/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAsync } from "./src/lib/hooks/useAsync";
import { EmployeesScreen } from "./src/pages/session/company/manager/user/EmployeesScreen";
import { EmployeeScreen } from "./src/pages/session/company/manager/user/EmployeeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  HomeScreen: undefined;
  CounterScreen: undefined;

  // Session screens
  LoginScreen: undefined;
  RegisterScreen: undefined;
  SessionScreen: undefined;

  CheckInfoScreen: Check;
  PlanningScreen: {
    date?: string;
    refresh?: boolean;
  };

  // Manage screens
  ApprovalsScreen: undefined;
  CUPlanningScreen: {
    date: string;
    planningId?: string;
  };

  // User screens (Manager)
  EmployeesScreen: undefined;
  EmployeeScreen: {
    userId: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export const App = (): ReactElement => {
  const { logoutLoading, appLoading, status, refresh, refreshing, session, logout } = useSession();
  const [notification_action, setNotification_action] = useState<string>("");

  useAsync(async() => {
    const notification_action = await AsyncStorage.getItem("notification_action");
    if (notification_action) {
      setNotification_action(notification_action);
      await AsyncStorage.removeItem("notification_action");
    }
  }, []);

  if (appLoading || logoutLoading || refreshing) {
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
        >Rafraîchir</Button>

        <Button
          mode="contained"
          onPress={() => {
            if (logoutLoading) return;
            void logout();
          }}
          loading={logoutLoading}
          style={{ marginTop: 10 }}
        >Se déconnecter</Button>
      </View>
    );
  }

  return (
    <Stack.Navigator
      // @ts-ignore
      initialRouteName={
        notification_action ? notification_action : session ? "HomeScreen" : "LoginScreen"
      }
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fffbfe"
        },
        animation: "none",
        header: (props) => (
          <>
            {/* @ts-ignore */}
            <AppBar {...props} />
            {/* {props.route.name == "HomeScreen" && <PlanningBannerNotPlanned />} */}
          </>
        )
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CounterScreen" component={CounterScreen} />

      {/* Session screens */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="SessionScreen" component={SessionScreen} />

      <Stack.Screen name="CheckInfoScreen" component={CheckInfoScreen} />
      {/* <Stack.Screen name="PlanningScreen" component={PlanningsScreen} /> */}

      {/* Manage screens */}
      <Stack.Screen name="ApprovalsScreen" component={ApprovalsScreen} />
      {/* <Stack.Screen name="CUPlanningScreen" component={CUPlanningScreen} /> */}

      {/* User screens (Manager) */}
      <Stack.Screen name="EmployeesScreen" component={EmployeesScreen} />
      <Stack.Screen name="EmployeeScreen" component={EmployeeScreen} />
    </Stack.Navigator>
  );
};