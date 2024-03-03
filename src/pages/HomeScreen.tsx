import type { ReactElement } from "react";
import { View } from "react-native";
import { useSession } from "../lib/hooks/useSession";
import type { RootStackParamList } from "../../App";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCard } from "../lib/components/checks/CheckCard";
import { WeeklyCheckCard } from "../lib/components/checks/WeeklyCheckCard";

type Props = NativeStackScreenProps<RootStackParamList>;

export const HomeScreen = ({ navigation }: Props): ReactElement => {
  const { session } = useSession();
  if (!session) navigation.navigate("LoginScreen");

  return (
    <View style={{ padding: 15, gap: 10 }}>
      <CheckCard />
      <WeeklyCheckCard />
    </View>
  );
};