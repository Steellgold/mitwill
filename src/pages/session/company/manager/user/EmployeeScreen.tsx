import { useState, type ReactElement } from "react";
import { Image, Linking, View } from "react-native";
import { ActivityIndicator, Banner, Text } from "react-native-paper";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../../../../App";
import { dayJS } from "../../../../../lib/dayjs/day-js";
import { avatarTime } from "../../../../../lib/dicebear";
import type { Database } from "../../../../../lib/db/supabase.types";
import { useSession } from "../../../../../lib/hooks/useSession";
import { WeeklyCheckCard } from "../../../../../lib/components/checks/WeeklyCheckCard";

type Props = NativeStackScreenProps<RootStackParamList, "EmployeeScreen">;

const banner = (employee: Database["public"]["Tables"]["users"]["Row"]): ReactElement => (
  <Banner visible style={{ flexDirection: "row" }} icon={() => (
    <Image source={{ uri: avatarTime(employee.avatar) }} style={{ width: 64, height: 64 }} />
  )} actions={[
    {
      icon: "email-send",
      label: "Contacter par email",
      onPress: () => void Linking.openURL(`mailto:${employee.email}?body=Bonjour%20${employee.firstName}%20${employee.lastName},%0A%0A`)
    }
  ]}>
    <View style={{ marginLeft: 10 }}>
      <Text variant="bodyLarge">{employee.firstName} {employee.lastName}</Text>
      <Text variant="bodySmall">Employé(e) depuis le {dayJS(employee.approvedAt).format("DD/MM/YYYY")}</Text>
    </View>
  </Banner>
);

export const EmployeeScreen = ({ route }: Props): ReactElement => {
  const [loading] = useState(false);
  const { role } = useSession();
  const { firstName, lastName, userId, approvedAt } = route.params;

  if (role == "EMPLOYEE") return (<Text>Erreur: Vous n'avez pas les droits pour accéder à cette page</Text>);
  if (!userId) return (<Text>Erreur: Aucun utilisateur trouvé</Text>);
  if (!firstName) return (<Text>Erreur: Aucun prénom trouvé</Text>);
  if (!lastName) return (<Text>Erreur: Aucun nom trouvé</Text>);
  if (!approvedAt) return (<Text>Erreur: Aucune date d'approbation trouvée</Text>);

  if (loading) {
    return (
      <>
        {banner({ ...route.params })}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#fd7e46" size={"large"} />
          <Text style={{ marginTop: 10 }}>Chargement des données de <Text style={{ fontWeight: "bold" }}>{firstName}</Text>...</Text>
        </View>
      </>
    );
  }

  return (
    <View>
      {banner({ ...route.params })}
      <View style={{ padding: 15 }}>
        <WeeklyCheckCard specificUserId={userId} />
      </View>
    </View>
  );
};