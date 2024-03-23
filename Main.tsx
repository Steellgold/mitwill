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
      PermissionsAndroid.check("android.permission.POST_NOTIFICATIONS")
        .then((granted) => {
          if (!granted) {
            PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS")
              .then((granted) => {
                if (!granted) {
                  console.error("Notification permission denied!");
                }
              })
              .catch((error) => console.error("Notification permission error:", error));
          }
        })
        .catch((error) => console.error("Notification permission error:", error));
    } catch (error) {
      console.error("Notification permission error:", error);
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