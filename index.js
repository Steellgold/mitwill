/* eslint-disable no-undef */
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import { Main } from "./Main";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OPEN_APPROBATION, OPEN_CHECKS } from "./codes";
import { fr, registerTranslation } from "react-native-paper-dates";
registerTranslation("fr", fr);

PushNotification.configure({
  onRegister: function(/** token */) {
    // console.log("TOKEN:", token);
  },

  onNotification: function(notification) {
    if (notification.data.action == OPEN_APPROBATION) {
      void AsyncStorage.setItem("notification_action", OPEN_APPROBATION);
    } else if (notification.data.action == "ChecksScreen") {
      void AsyncStorage.setItem("notification_action", OPEN_CHECKS);
    }

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  onAction: function(/** notification */) {
    // console.log("index.js", "ACTION:", notification.action);
    // console.log("index.js", "NOTIFICATION:", notification);
  },

  onRegistrationError: function(/** err */) {
    // console.error(err.message, err);
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true
  },

  popInitialNotification: true,
  requestPermissions: true
});

AppRegistry.registerComponent(appName, () => Main);