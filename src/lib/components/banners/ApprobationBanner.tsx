import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, type ReactElement } from "react";
import { Banner } from "react-native-paper";
import { useAsync } from "../../hooks/useAsync";
import { OPEN_APPROBATION } from "../../../../codes";

export const ApprobationNotificationBanner = (): ReactElement => {
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
      visible={name !== "ApprovalsScreen" && !ignore && notification !== OPEN_APPROBATION}
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
          navigate("ApprovalsScreen");
        } }
      ]}
      icon="bell"
    >
      Vous avez des comptes à valider, veuillez les valider pour qu'ils soient autorisés à se connecter à l'application.
    </Banner>
  );
};