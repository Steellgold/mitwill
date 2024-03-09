import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useSession } from "../../../../../lib/hooks/useSession";
import type { Database } from "../../../../../lib/db/supabase.types";
import { supabase } from "../../../../../lib/db/supabase";
import { useAsync } from "../../../../../lib/hooks/useAsync";
import { Button, Chip, Dialog, Portal, Searchbar, Text } from "react-native-paper";
import { ScrollView, View } from "react-native";

type User = Database["public"]["Tables"]["users"]["Row"];

type Props = {
  visible: boolean;
  hideDialog: () => void;
  onDismiss: () => void;
  onConfirm: (users: User[]) => void;

  defaultSelectedUsersIds?: string[];
};

export const ChooseEmployeesDialog = ({ visible, hideDialog, onDismiss, onConfirm, defaultSelectedUsersIds }: Props): ReactElement => {
  const { session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState(users);

  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const filtered = users.filter(user => (user.firstName || "").toLowerCase().includes(query)
        || (user.lastName || "").toLowerCase().includes(query)
        || user.userId.toString().includes(query)
        || (user.email && user.email.toLowerCase().includes(query)));

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  useAsync(async() => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return console.error("Error fetching users", error);
    setUsers(data || []);

    if (defaultSelectedUsersIds) {
      const selected = data?.filter((u) => defaultSelectedUsersIds.includes(u.userId.toString())) || [];
      setSelectedUsers(selected);
    }
  }, [defaultSelectedUsersIds]);

  const handleSelectUser = (user: User): void => {
    if (selectedUsers.some((u) => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="account-group" />
        <Dialog.Title>Choisir des employés</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodySmall">Sélectionnez les employés qui travailleront cette semaine</Text>
          <View style={{ marginVertical: 4 }} />

          <Searchbar
            placeholder="Rechercher un employé"
            onChangeText={setSearchQuery}
            mode="bar"
            value={searchQuery}
          />

          <View style={{ marginVertical: 4 }} />

          <ScrollView style={{ maxHeight: 200 }}>
            <View style={{ gap: 3 }}>
              {filteredUsers.map((user) => (
                <Chip
                  icon={selectedUsers.some((u) => u.userId === user.userId) ? "check" : "account"}
                  key={user.userId}
                  onPress={() => handleSelectUser(user)}
                  selected={selectedUsers.some((u) => u.userId === user.userId)}
                  showSelectedOverlay
                >
                  {user.firstName} {user.lastName} {user.userId === session?.user?.id ? "(vous)" : ""}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Annuler</Button>
          <Button onPress={() => onConfirm(selectedUsers)}>Confirmer</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};