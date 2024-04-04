import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { type ReactElement } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import type { RootStackParamList } from "../../../../../../App";

type Props = NativeStackScreenProps<RootStackParamList, "PeriodChecksScreen">;

export const PeriodChecksScreen = ({ route }: Props): ReactElement => {
  console.log(route.params);
  return (
    <View style={{ padding: 15, gap: 10 }}>
      <Text>Hello, World!</Text>
    </View>
  );
};