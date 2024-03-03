/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useRef, type ReactElement, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, FAB, Portal, TextInput } from "react-native-paper";
import { useSession } from "../../lib/hooks/useSession";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/db/supabase";

type Props = NativeStackScreenProps<RootStackParamList>;

export const SessionScreen = ({ navigation }: Props): ReactElement => {
  const { logout, session, logoutLoading } = useSession();
  if (!session) navigation.navigate("LoginScreen");
  const fabRef = useRef(null);

  const [editLoading, setEditLoading] = useState(false);
  const [firstName, setFirstName] = useState(session?.user.user_metadata.firstName);
  const [lastName, setLastName] = useState(session?.user.user_metadata.lastName);

  const handleEdit = async(): Promise<void> => {
    setEditLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { firstName, lastName } });
    const { error: error2 } = await supabase.from("users").update({ firstName, lastName }).eq("userId", session?.user.id || "");
    setEditLoading(false);
    if (error || error2) console.error("Error (handleEdit in SessionScreen.tsx l27):", error, error2);
  };

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <ScrollView style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TextInput
            label="Prénom"
            mode="outlined"
            value={firstName}
            onChangeText={setFirstName}
            style={{ width: "50%" }}
            disabled={logoutLoading || !session} />

          <TextInput
            label="Nom"
            mode="outlined"
            value={lastName}
            onChangeText={setLastName}
            style={{ width: "49%" }}
            disabled={logoutLoading || !session} />
        </View>

        <TextInput label="Email (Non modifiable)" mode="outlined" value={session?.user.email} disabled style={{ marginTop: 16 }} />

        <Button
          mode="contained"
          icon={"account-edit"}
          style={{ marginTop: 16 }}
          loading={editLoading}
          disabled={
            // eslint-disable-next-line max-len
            editLoading || !session || !firstName || !lastName || firstName === session?.user.user_metadata.firstName && lastName === session?.user.user_metadata.lastName}
          onPress={() => {
            handleEdit()
              .then(() => console.log("User profile updated"))
              .catch((error) => console.error("Error (handleEdit in SessionScreen.tsx l64):", error));
          }}
        >
          Mettre à jour
        </Button>

        <Portal>
          <FAB
            ref={fabRef}
            label="Déconnexion"
            mode="elevated"
            style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
            icon="logout"
            loading={logoutLoading}
            onPress={() => {
              logout()
                .then(() => console.log("Logout successful"))
                .catch((error) => console.error("ErrorI:", error));
            }}
          />
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};