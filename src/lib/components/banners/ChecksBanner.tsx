import { useNavigation, useRoute } from "@react-navigation/native";
import type { ReactElement } from "react";
import { useState } from "react";
import { Banner } from "react-native-paper";
import { useAsync } from "../../hooks/useAsync";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ChecksNotificationBanner = (): ReactElement => {
  const { navigate } = useNavigation();
  const [ignore, setIgnore] = useState(false);
  const { name } = useRoute();

  const [notification, setNotification] = useState("");

  useAsync(async() => {
    const notification = await AsyncStorage.getItem("notification_action");
    if (notification) setNotification(notification);
  }, []);

  return (
    <Banner
      visible={name !== "ChecksApprovalsScreen" && !ignore && notification === "ChecksScreen"}
      actions={[
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        { label: "Ignorer", onPress: async() => {
          setIgnore(true);
          await AsyncStorage.setItem("notification_action", "");
        } },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        { label: "Voir", onPress: async() => {
          await AsyncStorage.setItem("notification_action", "");
          // @ts-ignore
          navigate("ChecksApprovalsScreen");
        } }
      ]}
    >
      Vous devez valider certains pointages de vos employées, veuillez les valider pour qu'ils soient pris en compte à la fin du mois.
    </Banner>
  );
};