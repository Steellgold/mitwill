import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReactElement } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import type { RootStackParamList } from "../../../App";

type Props = NativeStackScreenProps<RootStackParamList, "CheckInfoScreen">;

export const CheckInfoScreen = ({ navigation, route }: Props): ReactElement => {
  return (
    <View>
      <Text>
        {JSON.stringify(route.params, null, 2)}
      </Text>
    </View>
  );
};