import { Text } from "react-native-paper";
import { APP_VERSION } from "../../v";
import type { ReactElement } from "react";

export const Version = (): ReactElement => {
  return (
    <Text style={{ position: "absolute", bottom: 10, textAlign: "center", width: "100%" }}>
      {`Mitwill ${APP_VERSION}`}
    </Text>
  );
};