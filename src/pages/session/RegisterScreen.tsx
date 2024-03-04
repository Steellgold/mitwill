import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";
import { useSession } from "../../lib/hooks/useSession";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { supabase } from "../../lib/db/supabase";

type Props = NativeStackScreenProps<RootStackParamList>;

export const RegisterScreen = ({ navigation }: Props): ReactElement => {
  const { session } = useSession();
  if (session) {
    navigation.popToTop();
    navigation.navigate("HomeScreen");
  }

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async(): Promise<void> => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({ email, password, options: { data: { firstName, lastName } } });
    if (error) {
      setError(error.message);
      setLoading(false);
      console.log("Error (handleRegister in RegisterScreen.tsx l32):", error.message);
    } else {
      setLoading(true);
      const { error } = await supabase.from("users").upsert({ userId: session?.user?.id || "", firstName, lastName, email });
      if (error) {
        setError(error.message);
        setLoading(false);
        console.log("Error (handleRegister in RegisterScreen.tsx l39):", error.message);
      }

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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TextInput
            label="Prénom"
            mode="outlined"
            style={{ marginTop: 10, width: "48%" }}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            label="Nom"
            mode="outlined"
            style={{ marginTop: 10, width: "48%" }}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

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
          if (!firstName || !lastName || !email || !password) return setError("Tous les champs sont obligatoires");
          if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return setError("Adresse email invalide");
          if (password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères");
          if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W|_)[A-Za-z\d\W_]{8,}$/)) {
            return setError("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial");
          }
          if (firstName.length < 2 || lastName.length < 2) return setError("Le prénom et le nom doivent contenir au moins 2 caractères");


          if (!loading) handleRegister()
            .then(() => console.log("Registered"))
            .catch((error) => console.error("Error (handleRegister in RegisterScreen.tsx l107):", error));
        }} style={{ marginTop: 10 }}>
        Inscription à l'application
      </Button>
      <Text style={{ marginTop: 5, alignSelf: "center" }}>Tu as déjà un compte ?
        <Text style={{ color: "#fd7e46" }} onPress={() => navigation.push("LoginScreen")}>{" "}Connecte-toi</Text>
      </Text>
    </View>
  );
};