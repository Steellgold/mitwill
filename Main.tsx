import type { ReactElement } from "react";
import React from "react";
import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { Providers } from "./src/lib/providers";
import { App } from "./App";
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
    messaging().requestPermission()
      .then((authStatus) => console.log("Notification permission status:", authStatus))
      .catch((error) => console.log("Notification permission error:", error));

    messaging().onTokenRefresh(token => {
      AsyncStorage.setItem("fcmToken", token)
        .then(() => console.log("Token saved!", token))
        .catch(() => console.log("Token not saved!", token));
    });

    const as = async(): Promise<void> => await AsyncStorage.setItem("fcmToken", await messaging().getToken());
    as().then(() => console.log("Token saved!")).catch(() => console.log("Token not saved!"));
  }, []);

  return (
    <Providers>
      <App />
    </Providers>
  );
};