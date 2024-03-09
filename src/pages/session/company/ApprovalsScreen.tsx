/* eslint-disable camelcase */
import { useState, type ReactElement } from "react";
import { useSession } from "../../../lib/hooks/useSession";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Card, Checkbox, Dialog, Divider, Portal, Text, TextInput } from "react-native-paper";
import type { Database } from "../../../lib/db/supabase.types";
import { useAsync } from "../../../lib/hooks/useAsync";
import { supabase } from "../../../lib/db/supabase";
import { dayJS } from "../../../lib/dayjs/day-js";

export const ApprovalsScreen = (): ReactElement => {
  const { session, role } = useSession();
  const [dialogVisibleFD, setDialogVisibleFD] = useState(false);
  const [dialogVisibleFA, setDialogVisibleFA] = useState(false);
  const [dialogVisibleFRAC, setDialogVisibleFRAC] = useState(false);
  const [reason, setReason] = useState("");

  const [addReason, setAddReason] = useState(false);

  const [users, setUsers] = useState<{
    approveds: Database["public"]["Tables"]["users"]["Row"][] | [];
    waitings: Database["public"]["Tables"]["users"]["Row"][] | [];
    declineds: Database["public"]["Tables"]["users"]["Row"][] | [];
  }>({
    approveds: [],
    waitings: [],
    declineds: []
  });

  if (!session) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Veuillez vous connecter pour accéder à cette page</Text>
      </View>
    );
  }

  if (role !== "MANAGER") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Vous n'avez pas les droits pour accéder à cette page</Text>
      </View>
    );
  }

  useAsync(async() => {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) console.error("Error:", error);
    if (data) {
      const approveds = data.filter((user: Database["public"]["Tables"]["users"]["Row"]) => user.status === "APPROVED");
      const waitings = data.filter((user: Database["public"]["Tables"]["users"]["Row"]) => user.status === "WAITING");
      const declineds = data.filter((user: Database["public"]["Tables"]["users"]["Row"]) => user.status === "DECLINED");

      setUsers({ approveds, waitings, declineds });
    }
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <View>
            <Text variant="bodyMedium">Utilisateurs en attente de validation</Text>
            <Divider style={{ marginVertical: 5 }} />

            {users.waitings.length === 0 && (
              <Card>
                <Card.Content>
                  <Text>Aucun utilisateur n'est en attente de validation</Text>
                </Card.Content>
              </Card>)
            }

            {users.waitings.map((user) => (
              <View key={user.userId}>
                {user && user.status === "WAITING" && (
                  <Card key={user.userId} style={{ marginVertical: 5 }}>
                    <Card.Title
                      title={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                      subtitle={"Compte créé le " + dayJS(user.createdAt).format("DD/MM/YYYY")}
                      subtitleStyle={{ marginTop: -5 }}
                      subtitleVariant="bodySmall"
                      // left={() => <Avatar.Image size={40} source={{ uri: getAvatar(user.email) }} />}
                    />

                    <Card.Actions>
                      <Button
                        mode="text"
                        onPress={() => setDialogVisibleFD(true)}>Refuser l'accès</Button>

                      <Portal>
                        <Dialog visible={dialogVisibleFD} onDismiss={() => setDialogVisibleFD(false)}>
                          <Dialog.Title>Confirmation</Dialog.Title>
                          <Dialog.Content>
                            <Text>Voulez-vous vraiment refuser cet utilisateur?</Text>

                            <Checkbox.Item
                              label="Ajouter une raison"
                              status={addReason ? "checked" : "unchecked"}
                              onPress={() => {
                                setAddReason(!addReason);
                                setReason(addReason ? "" : "Raison non spécifiée (N/A)");
                              }}
                            />

                            <TextInput
                              label="Raison du refus"
                              mode="outlined"
                              style={{ marginTop: 10 }}
                              inputMode="text"
                              multiline
                              disabled={!addReason}
                              value={reason}
                              onChangeText={setReason}
                            />
                          </Dialog.Content>
                          <Dialog.Actions>
                            <Button onPress={() => setDialogVisibleFD(false)}>Annuler</Button>
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <Button onPress={async() => {
                              setDialogVisibleFD(false);

                              const { data, error } = await supabase
                                .rpc("decline_user", { user_id: user.userId, reason });
                              if (error) console.error("Error:", error);
                              if (data) {
                                setUsers((prev) => ({
                                  ...prev,
                                  waitings: prev.waitings.filter((u) => u.userId !== user.userId),
                                  declineds: [...prev.declineds, user]
                                }));

                                console.log("User declined:", user);

                                await supabase
                                  .functions
                                  .invoke("push", {
                                    body: {
                                      record: {
                                        user_id: user.userId,
                                        body: `Votre demande d'accès a été refusée${reason ? ` pour la raison suivante: ${reason}` : ""}`
                                      }
                                    }
                                  })
                                  .then((res) => console.log("Push response:", res))
                                  .catch((error) => console.error("Error:", error));

                                setReason("");
                                setAddReason(false);
                              }
                            }}>Confirmer</Button>
                          </Dialog.Actions>
                        </Dialog>
                      </Portal>

                      <Button
                        mode="contained-tonal"
                        onPress={() => setDialogVisibleFA(true)}>Autoriser l'accès</Button>

                      <Portal>
                        <Dialog visible={dialogVisibleFA} onDismiss={() => setDialogVisibleFA(false)}>
                          <Dialog.Title>Confirmation</Dialog.Title>
                          <Dialog.Content>
                            <Text>Voulez-vous vraiment approuver cet utilisateur?</Text>
                          </Dialog.Content>
                          <Dialog.Actions>
                            <Button onPress={() => setDialogVisibleFA(false)}>Annuler</Button>
                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <Button onPress={async() => {
                              setDialogVisibleFA(false);

                              const { error, status } = await supabase
                                .rpc("approve_user", { user_id: user.userId });
                              if (error) console.error("Error:", error);
                              if (status == 204) {
                                setUsers((prev) => ({
                                  ...prev,
                                  waitings: prev.waitings.filter((u) => u.userId !== user.userId),
                                  approveds: [...prev.approveds, user]
                                }));

                                await supabase.functions
                                  .invoke("push", {
                                    body: {
                                      record: {
                                        user_id: user.userId,
                                        body: "Votre demande d'accès a été approuvée"
                                      }
                                    }
                                  })
                                  .then((res) => console.log("Push response:", res))
                                  .catch((error) => console.error("Error:", error));

                                setReason("");
                                setAddReason(false);
                              }
                            }}>Confirmer</Button>
                          </Dialog.Actions>
                        </Dialog>
                      </Portal>
                    </Card.Actions>
                  </Card>
                )}
              </View>
            ))}
          </View>

          <View style={{ marginVertical: 10 }} />

          <View>
            <Text variant="bodyMedium">Utilisateurs approuvés</Text>
            <Divider style={{ marginVertical: 5 }} />

            {users.approveds.length === 0 && (
              <Card>
                <Card.Content>
                  <Text>Aucun utilisateur n'a été approuvé (cela ne devrait pas arriver...)</Text>
                </Card.Content>
              </Card>)
            }

            {users.approveds.map((user) => (
              <Card key={user.userId} style={{ marginVertical: 5 }}>
                <Card.Title
                  title={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                  subtitle={"Approuvé le " + dayJS(user.approvedAt).format("DD/MM/YYYY")}
                  subtitleStyle={{ marginTop: -5 }}
                  subtitleVariant="bodySmall"
                  // left={() => <Avatar.Image size={40} source={{ uri: getAvatar(user.email) }} />}
                />

                {user.userId !== session?.user.id && user.role == "EMPLOYEE" && (
                  <Card.Actions>
                    <Button mode="text" onPress={() => setDialogVisibleFRAC(true)}>Retirer l'accès</Button>

                    <Portal>
                      <Dialog visible={dialogVisibleFRAC} onDismiss={() => setDialogVisibleFRAC(false)}>
                        <Dialog.Title>Confirmation</Dialog.Title>
                        <Dialog.Content>
                          <Text>Voulez-vous vraiment retirer l'accès à cet utilisateur?</Text>

                          <Checkbox.Item
                            label="Ajouter une raison"
                            status={addReason ? "checked" : "unchecked"}
                            onPress={() => {
                              setAddReason(!addReason);
                              setReason(addReason ? "" : "Raison non spécifiée (N/A)");
                            }}
                          />

                          <TextInput
                            label="Raison du retrait d'accès"
                            mode="outlined"
                            style={{ marginTop: 10 }}
                            inputMode="text"
                            multiline
                            disabled={!addReason}
                            value={reason}
                            onChangeText={setReason}
                          />
                        </Dialog.Content>
                        <Dialog.Actions>
                          <Button onPress={() => setDialogVisibleFRAC(false)}>Annuler</Button>
                          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                          <Button onPress={async() => {
                            setDialogVisibleFRAC(false);

                            const { data, error } = await supabase
                              .rpc("decline_user", { user_id: user.userId, reason });
                            if (error) console.error("Error:", error);
                            if (data) {
                              setUsers((prev) => ({
                                ...prev,
                                approveds: prev.approveds.filter((u) => u.userId !== user.userId),
                                declineds: [...prev.declineds, user]
                              }));

                              await supabase
                                .functions
                                .invoke("push", {
                                  body: {
                                    record: {
                                      user_id: user.userId,
                                      body: `Votre accès a été retiré${reason ? ` pour la raison suivante: ${reason}` : ""}`
                                    }
                                  }
                                })
                                .then((res) => console.log("Push response:", res))
                                .catch((error) => console.error("Error:", error));

                              setReason("");
                              setAddReason(false);
                            }
                          }}>Confirmer</Button>
                        </Dialog.Actions>
                      </Dialog>
                    </Portal>
                  </Card.Actions>
                )}
              </Card>
            ))}
          </View>

          <View style={{ marginVertical: 10 }} />

          <View>
            <Text variant="bodyMedium">Utilisateurs refusés</Text>
            <Divider style={{ marginVertical: 5 }} />

            {users.declineds.length === 0 && (
              <Card>
                <Card.Content>
                  <Text>Aucun utilisateur n'a été refusé</Text>
                </Card.Content>
              </Card>)
            }

            {users.declineds.map((user) => (
              <Card key={user.userId} style={{ marginVertical: 5 }}>
                <Card.Title
                  title={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                  subtitle={"Refusé le " + dayJS(user.declinedAt).format("DD/MM/YYYY")}
                  subtitleStyle={{ marginTop: -5 }}
                  subtitleVariant="bodySmall"
                  // left={() => <Avatar.Image size={40} source={{ uri: getAvatar(user.email) }} />}
                />

                {user.declinedFor && (
                  <Card.Content>
                    <Text variant="bodyMedium">Raison du refus (seulement visible par vous):</Text>
                    <Text variant="bodySmall">{user.declinedFor}</Text>
                  </Card.Content>
                )}

                <Card.Actions>
                  <Button
                    mode="text"
                    disabled={user.userId === session?.user.id || true}
                    onPress={() => console.log("Approve user")}>
                      Autoriser l'accès
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};