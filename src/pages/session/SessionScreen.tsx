import type { ReactElement } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { useSession } from "../../lib/hooks/useSession";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

type Props = NativeStackScreenProps<RootStackParamList>;

export const SessionScreen = ({ navigation }: Props): ReactElement => {
  const { session } = useSession();
  if (!session) navigation.navigate("LoginScreen");

  return (
    <View>
      <Text>Session</Text>
    </View>
  );
};