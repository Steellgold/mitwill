/* eslint-disable camelcase */
import React, { useEffect, useState } from "react";
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
import { Platform, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { ApprovalsScreen } from "./src/pages/session/company/ApprovalsScreen";
import type { Check } from "./src/lib/providers/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EmployeesScreen } from "./src/pages/session/company/manager/user/EmployeesScreen";
import { EmployeeScreen } from "./src/pages/session/company/manager/user/EmployeeScreen";
import { ChecksApprovalsScreen } from "./src/pages/check/ApprovalsScreen";
import { OPEN_APPROBATION } from "./codes";
import { ApprobationNotificationBanner } from "./src/lib/components/banners/ApprobationBanner";
import { ChecksNotificationBanner } from "./src/lib/components/banners/ChecksBanner";
import type { Database } from "./src/lib/db/supabase.types";
import { UpdateBanner } from "./src/lib/components/banners/UpdateBanner";
import { Version } from "./src/lib/version";

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  HomeScreen: undefined;
  CounterScreen: undefined;

  LoginScreen: undefined;
  RegisterScreen: undefined;
  SessionScreen: undefined;

  CheckInfoScreen: {
    check: Check;
    isManager?: boolean;
  };

  ApprovalsScreen: undefined;
  ChecksApprovalsScreen: undefined;


  EmployeesScreen: undefined;
  EmployeeScreen: Database["public"]["Tables"]["users"]["Row"];
};

export const App = (): ReactElement => {
  const { logoutLoading, appLoading, status, refresh, refreshing, session, logout } = useSession();
  const [notification_action, setNotification_action] = useState<string>("");

  useEffect(() => {
    const checkNotification = async(): Promise<void> => {
      const notification_action = await AsyncStorage.getItem("notification_action");
      if (notification_action) setNotification_action(notification_action);
    };

    checkNotification().catch(console.error);
  }, [appLoading, logoutLoading, refreshing]);

  if (appLoading || logoutLoading || refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 3, backgroundColor: "#fffbfe" }}>
        <ActivityIndicator size={"large"} style={{ marginBottom: 10 }} color="#fd7e47" />
        {logoutLoading ? <Text>Déconnexion en cours...</Text> : <Text>Chargement de l'application...</Text>}
        <Version />
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

        <Button mode="contained-tonal" icon="refresh" loading={refreshing} style={{ marginTop: 10 }}
          onPress={() => {
            if (refreshing) return;
            refresh?.();
          }}
        >Rafraîchir</Button>

        <Button mode="contained" loading={logoutLoading} style={{ marginTop: 10 }}
          onPress={() => {
            if (logoutLoading) return;
            void logout();
          }}
        >Se déconnecter</Button>
      </View>
    );
  }

  return (
    <Stack.Navigator
      // @ts-ignore
      initialRouteName={session ? "HomeScreen" : "LoginScreen"}
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fffbfe"
        },
        animation: "none",
        header: (props) => (
          <>
            {/* @ts-ignore */}
            <AppBar {...props} />

            {notification_action == OPEN_APPROBATION && <ApprobationNotificationBanner />}
            {Platform.OS === "android" && props.route.name == "HomeScreen" && <ChecksNotificationBanner />}
            <UpdateBanner />
          </>
        )
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CounterScreen" component={CounterScreen} />

      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="SessionScreen" component={SessionScreen} />

      <Stack.Screen name="CheckInfoScreen" component={CheckInfoScreen} />
      <Stack.Screen name="ApprovalsScreen" component={ApprovalsScreen} />
      <Stack.Screen name="ChecksApprovalsScreen" component={ChecksApprovalsScreen} />
      <Stack.Screen name="EmployeesScreen" component={EmployeesScreen} />
      <Stack.Screen name="EmployeeScreen" component={EmployeeScreen} />
    </Stack.Navigator>
  );
};