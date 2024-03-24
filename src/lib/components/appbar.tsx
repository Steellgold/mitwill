import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement, useEffect } from "react";
import { Image, View } from "react-native";
import { Appbar, Badge, Text, Tooltip } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../hooks/useSession";
import { supabase } from "../db/supabase";

type Props = NativeStackScreenProps<RootStackParamList>;

export const AppBar = ({ navigation, route }: Props): ReactElement => {
  const { session, role, isMeti } = useSession();
  const [state, setState] = useState<number>(0);
  const [stateChecks, setStateChecks] = useState<number>(0);

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
    const fetchWaiting = async(): Promise<void> => {
      if (role !== "MANAGER") return;
      const { data, error } = await supabase.rpc("count_users_waiting");
      if (error) console.error("Error:", error);
      else {
        setWaitingUsers(data);
        setState(data);
      }
    };

    const fetchChecksWaiting = async(): Promise<void> => {
      if (!isMeti) return;
      const { data, error } = await supabase.rpc("count_pending_checks");
      if (error) console.error("Error:", error);
      else {
        setStateChecks(data);
      }
    };

    if (role === "MANAGER") fetchWaiting().catch(console.error);
    if (isMeti) fetchChecksWaiting().catch(console.error);
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

      {/* <Tooltip title="Plannings" leaveTouchDelay={200} enterTouchDelay={200}>
        <Appbar.Action icon="calendar-month" onPress={() => navigation.push("PlanningScreen", {
          date: dayJS().format("YYYY-MM-DD")
        })} disabled={route.name === "PlanningScreen"} />
      </Tooltip> */}

      {role === "MANAGER" && (
        <View style={{ position: "relative" }}>
          <Tooltip title="Approbations" leaveTouchDelay={200} enterTouchDelay={200}>
            <Appbar.Action
              icon="stamper"
              onPress={() => navigation.push("ApprovalsScreen")}
              disabled={role !== "MANAGER"}
            />
          </Tooltip>
          {waitingUsers > 0 && <Badge style={{ position: "absolute", top: 0, right: 0 }} visible={true}>{state}</Badge>}
        </View>
      )}

      {role === "MANAGER" && isMeti && (
        <View style={{ position: "relative" }}>
          <Tooltip title="Pointages" leaveTouchDelay={200} enterTouchDelay={200}>
            <Appbar.Action
              icon="progress-clock"
              onPress={() => navigation.push("ChecksApprovalsScreen")}
              disabled={!isMeti || role !== "MANAGER"}
            />
          </Tooltip>
          {stateChecks > 0 && <Badge style={{ position: "absolute", top: 0, right: 0 }} visible={true}>{stateChecks}</Badge>}
        </View>
      )}

      {role === "MANAGER" && (
        <Appbar.Action
          icon="account-group"
          onPress={() => navigation.push("EmployeesScreen")}
          disabled={role !== "MANAGER"}
        />
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