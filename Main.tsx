import type { ReactElement } from "react";
import React from "react";
import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { Providers } from "./src/lib/providers";
import { App } from "./App";
import PushNotification from "react-native-push-notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermissionsAndroid, Platform } from "react-native";

export const Main = (): ReactElement => {
  if (Platform.OS === "android") {
    try {
      PermissionsAndroid.check("android.permission.POST_NOTIFICATIONS").then(
        response => {
          if (!response) {
            PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS")
              .then(granted => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) console.log("You can use the notification");
                else console.log("Notification permission denied");
              })
              .catch(err => {
                console.log(err);
              });
          }
        }
      ).catch(err => console.log("Notification Error=====>", err));
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    messaging()
      .requestPermission()
      .then((authStatus) => {
        console.log("Notification permission status:", authStatus);
      })
      .catch((error) => {
        console.log("Notification permission error:", error);
      });

    messaging().onTokenRefresh(token => {
      AsyncStorage.setItem("fcmToken", token)
        .then(() => console.log("Token saved!", token))
        .catch(() => console.log("Token not saved!", token));
    });

    // Ecouter les notifications reçues lorsque l'appli est ouverte
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body,
        channelId: "fcm_fallback_notification_channel",
        messageId: remoteMessage.messageId
      });
    });

    return unsubscribe;
  }, []);

  return (
    <Providers>
      <App />
    </Providers>
  );
};