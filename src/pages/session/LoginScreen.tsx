import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";
import type { RootStackParamList } from "../../../App";
import { useSession } from "../../lib/hooks/useSession";
import { supabase } from "../../lib/db/supabase";

type Props = NativeStackScreenProps<RootStackParamList>;

export const LoginScreen = ({ navigation }: Props): ReactElement => {
  const { session } = useSession();
  if (session) {
    navigation.popToTop();
    navigation.navigate("HomeScreen");
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async(): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      console.error("Error:C", error.message);
    } else {
      setLoading(false);
      setError("");
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <View style={{ height: 40 }}/>

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <View style={{ opacity: loading ? 0.2 : 1, position: "relative" }}>
        <ActivityIndicator animating={loading} color="#fd7e46" size={"large"} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}/>
        <TextInput
          label="Adresse email"
          mode="outlined"
          keyboardType="email-address"
          style={{ marginTop: 5 }}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          label="Mot de passe"
          mode="outlined"
          secureTextEntry
          style={{ marginTop: 5 }}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Button
        mode="contained"
        buttonColor="#fd7e46"
        loading={loading}
        onPress={() => {
          if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return setError("Adresse email invalide");
          if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères");

          if (error) setError("");
          setLoading(true);

          if (!loading) handleLogin()
            .then(() => console.log("Logged in"))
            .catch((error) => console.error("ErrorA:", error));
        }} style={{ marginTop: 10 }}>
        Connexion à l'application
      </Button>
      <Text style={{ marginTop: 5, alignSelf: "center" }}>Tu n'as pas de compte ?
        <Text style={{ color: "#fd7e46" }} onPress={() => navigation.push("RegisterScreen")}>{" "}Inscris-toi</Text>
      </Text>
    </View>
  );
};