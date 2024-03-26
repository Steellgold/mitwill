/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type ReactElement, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Dialog, FAB, Portal, Text, TextInput, TouchableRipple } from "react-native-paper";
import { useSession } from "../../lib/hooks/useSession";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/db/supabase";
import { useIsFocused } from "@react-navigation/native";
import { pickSingle } from "react-native-document-picker";
import FastImage from "react-native-fast-image";
import { avatarTime, getAvatar } from "../../lib/dicebear";

type Props = NativeStackScreenProps<RootStackParamList>;

export const SessionScreen = ({ navigation }: Props): ReactElement => {
  const { logout, session, logoutLoading, uuid, avatar, setAvatar } = useSession();
  if (!session) navigation.navigate("LoginScreen");
  const [fileError, setFileError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const [editLoading, setEditLoading] = useState(false);
  const [firstName, setFirstName] = useState(session?.user.user_metadata.firstName);
  const [lastName, setLastName] = useState(session?.user.user_metadata.lastName);
  const [loading, setLoading] = useState(false);

  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [dialogPasswordVisible, setDialogPasswordVisible] = useState(false);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleEdit = async(): Promise<void> => {
    setEditLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { firstName, lastName } });
    const { error: error2 } = await supabase.from("users").update({ firstName, lastName }).eq("userId", session?.user.id || "");
    setEditLoading(false);
    if (error || error2) console.error("Error (handleEdit in SessionScreen.tsx l27):", error, error2);
  };

  const handleChangePassword = async(): Promise<void> => {
    setPasswordChangeLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password1 });

    if (error) console.error("Error (handleChangePassword in SessionScreen.tsx l36):", error);

    setPasswordChangeLoading(false);
    setDialogPasswordVisible(false);
    setPassword1("");
    setPassword2("");
    setPasswordError(null);
    void logout();
  };

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <ScrollView style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ justifyContent: "flex-start", alignItems: "flex-start", width: "30%", marginTop: 5 }}>
            <TouchableRipple
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={async() => {
                const file  = await pickSingle({ type: ["image/png", "image/jpeg"] });

                setLoading(true);
                if (avatar) {
                  const { data: removeData, error: removeError } = await supabase.storage.from("avatars").remove([`${uuid}.png`]);
                  if (removeError) console.error("Error removing existing avatar:", removeError);
                  if (!removeData) console.error("No data returned from remove avatar");
                  console.log("removeData", removeData);
                }

                const { data, error } = await supabase.storage.from("avatars").upload(`${uuid}.png`, file, {
                  contentType: "image/png",
                  cacheControl: "3600"
                });
                if (error) {
                  console.error("Error uploading file:", error);
                  setFileError(error.message);
                }

                if (!data) {
                  console.error("No data returned from file upload");
                  setFileError("No data returned from file upload");
                }

                const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(`${uuid}.png`);
                if (!publicUrl) setFileError("No publicUrl returned from file upload");

                const { data: userData, error: userError } = await supabase.from("users")
                  .update({ avatar: publicUrl }).eq("userId", session?.user.id || "");

                if (userError) {
                  console.error("Error updating user:", userError);
                  setFileError(userError.message);
                }

                if (!userData) setFileError("No data returned from user update");

                if (publicUrl) {
                  setFileError(null);
                  setLoading(false);
                  setAvatar(avatarTime(publicUrl));
                }
              }}
              borderless
              style={{ borderRadius: 10, width: 100, height: 100 }}>
              <>
                {loading && <ActivityIndicator color="#fd7e46" />}
                {avatar && !loading && <FastImage
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  source={{ cache: "web", uri: avatarTime(avatar) || getAvatar(firstName, lastName) }}
                  style={{ width: 100, height: 100, borderRadius: 10 }}
                  onLoadEnd={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />}
              </>
            </TouchableRipple>
          </View>

          <View style={{ flexDirection: "column", width: "70%" }}>
            <TextInput
              label="Prénom"
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              style={{ width: "100%" }}
              disabled={logoutLoading || !session} />

            <TextInput
              label="Nom"
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={{ width: "100%" }}
              disabled={logoutLoading || !session} />
          </View>
        </View>

        {fileError && <Text style={{ color: "red" }}>{fileError}</Text>}

        <TextInput label="Email (Non modifiable)" mode="outlined" value={session?.user.email} disabled style={{ marginTop: 16 }} />

        <Portal>
          <Dialog visible={dialogPasswordVisible} onDismiss={() => setDialogPasswordVisible(false)} dismissable={false}>
            <Dialog.Icon icon="lock" />
            <Dialog.Title>Changer de mot de passe</Dialog.Title>

            <Dialog.Content>
              <Text>Veuillez saisir votre nouveau mot de passe&nbsp;
                <Text style={{ color: "#e94e4e" }}>(Une fois validé une reconexion sera nécessaire)</Text></Text>
              {passwordError && <Text style={{ color: "red" }}>{passwordError}</Text>}
              <View style={{ marginVertical: 10 }} />

              <View style={{ flexDirection: "column", gap: 10 }}>
                <TextInput label="Nouveau mot de passe" mode="outlined" secureTextEntry value={password1} onChangeText={setPassword1} />
                <TextInput label="Confirmer le nouveau mot de passe" mode="outlined" secureTextEntry value={password2} onChangeText={setPassword2} />
              </View>
            </Dialog.Content>

            <Dialog.Actions>
              <Button
                onPress={() => {
                  setDialogPasswordVisible(false);
                  setPassword1("");
                  setPassword2("");
                  setPasswordError(null);
                }}
                disabled={passwordChangeLoading}
              >Annuler</Button>

              <Button
                loading={passwordChangeLoading}
                disabled={passwordChangeLoading}
                onPress={() => {
                  if (password1 !== password2) return setPasswordError("Les mots de passe ne correspondent pas");
                  if (password1.length < 6) return setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
                  if (!password1.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W|_)[A-Za-z\d\W_]{8,}$/)) {
                    // eslint-disable-next-line max-len
                    return setPasswordError("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial");
                  }

                  setPasswordError(null);
                  handleChangePassword()
                    .then(() => console.log("Password changed"))
                    .catch((error) => console.error("Error (handleChangePassword in SessionScreen.tsx l98):", error));
                }}
              >Changer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Button
          mode="contained-tonal"
          icon="format-letter-case"
          style={{ marginTop: 16 }}
          loading={editLoading}
          disabled={editLoading || !session || !avatar}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress={async() => {
            setLoading(true);
            const { data, error } = await supabase.storage.from("avatars").remove([`${uuid}.png`]);
            if (error) console.error("Error removing avatar:", error);
            if (!data) console.error("No data returned from remove avatar");

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const newAvatar = getAvatar(firstName, lastName);

            const { status } = await supabase.from("users").update({ avatar: newAvatar }).eq("userId", session?.user.id || "");
            if (status !== 204) console.error("Error updating user avatar:", status);

            setAvatar(newAvatar);
            setLoading(false);
          }}
        >
          Remettre par défaut l'avatar
        </Button>

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

        <Button mode="contained-tonal" icon="shield-lock" style={{ marginTop: 16 }} onPress={() => setDialogPasswordVisible(true)}>
          Changer mon mot de passe
        </Button>

        <Portal>
          <FAB
            label="Déconnexion"
            mode="elevated"
            style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
            icon="logout"
            loading={logoutLoading}
            visible={isFocused && session !== null && !dialogPasswordVisible}
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