import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { ActivityIndicator, Avatar, Card, Divider, Searchbar, Text, TouchableRipple } from "react-native-paper";
import { useAsync } from "../../../../../lib/hooks/useAsync";
import { supabase } from "../../../../../lib/db/supabase";
import type { Database } from "../../../../../lib/db/supabase.types";
import { getAvatar } from "../../../../../lib/dicebear";

type User = Database["public"]["Tables"]["users"]["Row"];

export const EmployeesScreen = (): ReactElement => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");

  const filteredUsers = users.filter((user) => {
    return user.firstName?.toLowerCase().includes(search.toLowerCase()) || user.lastName?.toLowerCase().includes(search.toLowerCase());
  });

  useAsync(async() => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) return console.error("Error fetching employees", error);
    if (!data) return console.error("No employees found");

    setUsers(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#fd7e46" size={"large"} />
        <Text style={{ marginTop: 10 }}>Chargement des employés...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 15, gap: 10 }}>
      <Text variant="bodyLarge">Employés</Text>
      <Text variant="bodySmall" style={{ marginTop: -10, marginBottom: 2 }}>Cliquez sur un employé pour accéder à son profil détaillé</Text>

      <Searchbar placeholder="Rechercher un employé" value={search} onChangeText={setSearch} />

      <Divider style={{ marginBottom: 10, marginTop: 3 }} />

      {filteredUsers.map((user) => (
        <Card key={user.userId}>
          <TouchableRipple borderless style={{ borderRadius: 10, padding: 15 }} onPress={() => console.log("Go to employee")}>
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text>{user.firstName} {user.lastName}</Text>
                  <Text variant="bodySmall">{user.email}</Text>
                </View>
                <Avatar.Image size={50} source={{ uri: user.avatar || getAvatar(user.firstName || "", user.lastName || "") }} />
              </View>
            </>
          </TouchableRipple>
        </Card>
      ))}
    </View>
  );
};