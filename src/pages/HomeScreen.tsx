import { useState, type ReactElement } from "react";
import { RefreshControl, SafeAreaView, ScrollView, View } from "react-native";
import { useSession } from "../lib/hooks/useSession";
import type { RootStackParamList } from "../../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCard } from "../lib/components/checks/CheckCard";
import { WeeklyCheckCard } from "../lib/components/checks/WeeklyCheckCard";
import { CheckFAB } from "../lib/components/checks/CheckFAB";
import { useIsFocused } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList>;

export const HomeScreen = ({ navigation }: Props): ReactElement => {
  const { session, refresh } = useSession();
  if (!session) navigation.navigate("LoginScreen");

  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <SafeAreaView>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          refresh?.()
            // @ts-ignore
            .then(() => setRefreshing(false))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .catch(() => setRefreshing(false));
        }} />
      }>
        <View style={{ padding: 15, gap: 10 }}>
          <CheckCard />
          <WeeklyCheckCard />

          <View style={{ height: 100 }} />

          <CheckFAB visible={isFocused} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};