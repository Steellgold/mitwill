import { NavigationContainer } from "@react-navigation/native";
import type { PropsWithChildren, ReactElement } from "react";
import { StatusBar } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SessionProvider } from "./providers/session";

type ProvidersProps = PropsWithChildren;

export const Providers = ({ children }: ProvidersProps): ReactElement => {
  return (
    <NavigationContainer>
      <PaperProvider theme={{ roundness: 3, dark: false }}>
        <SessionProvider>
          <StatusBar barStyle="dark-content" backgroundColor={"#fffbfe"} />
          {children}
        </SessionProvider>
      </PaperProvider>
    </NavigationContainer>
  );
};