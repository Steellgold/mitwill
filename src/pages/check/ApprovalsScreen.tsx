/* eslint-disable camelcase */
import { useState, type ReactElement } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import type { Database } from "../../lib/db/supabase.types";
import { useSession } from "../../lib/hooks/useSession";
import { supabase } from "../../lib/db/supabase";
import { useAsync } from "../../lib/hooks/useAsync";
import { dayJS } from "../../lib/dayjs/day-js";
import { useNavigation } from "@react-navigation/native";
import { ChooseDeclineTimeDialog } from "../session/company/manager/dialogs/ChooseDeclineTime";
import { NO_ACTION } from "../../../codes";

export const ChecksApprovalsScreen = (): ReactElement => {
  const { session, role, firstName, lastName } = useSession();
  const { navigate } = useNavigation();

  const [checks, setChecks] = useState<{
    employee: Database["public"]["Tables"]["users"]["Row"] | null;
    check: Database["public"]["Tables"]["checks"]["Row"];
  }[] | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);

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
      .from("checks")
      .select("*")
      .eq("need_validation", true);

    if (error) {
      console.error(error);
      return;
    }


    console.log(data);
    if (!data) return;

    const getEmployee = async(userId: string): Promise<Database["public"]["Tables"]["users"]["Row"] | null> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userId", userId);

      if (error) {
        console.error(error);
        return null;
      }

      return data?.[0];
    };

    const checks = await Promise.all(data.map(async(check) => {
      const employee = await getEmployee(check.userId);
      if (!employee) return { employee: null, check };
      return { employee, check };
    }));

    setChecks(checks);
  }, []);

  const approveCheck = async(check: Database["public"]["Tables"]["checks"]["Row"]): Promise<void> => {
    const { error } = await supabase.from("checks").update({ need_validation: false }).eq("uuid", check.uuid);

    if (error) {
      console.error(error);
      return;
    }

    setChecks((checks) => checks?.filter((c) => c.check.uuid !== check.uuid) || []);
  };

  const rejectCheck = async(check: Database["public"]["Tables"]["checks"]["Row"], start: string, end: string): Promise<void> => {
    const { error } = await supabase
      .from("checks")
      .update({
        need_validation: false,
        start: dayJS(check.start).format("YYYY-MM-DD") + "T" + start,
        end: dayJS(check.end).format("YYYY-MM-DD") + "T" + end
      })
      .eq("uuid", check.uuid);

    await supabase
      .functions
      .invoke("push", {
        body: {
          record: {
            user_id: check.userId,
            title: "Pointage modifié",
            body: `Votre pointage du ${dayJS(check.date).format("DD/MM/YYYY")} a été modifié par ${firstName} ${lastName}`,
            action: NO_ACTION
          }
        }
      })
      .then(() => console.log("Notification sent!"))
      .catch((error) => console.error("Error (handleRegister in RegisterScreen.tsx l39):", error));

    if (error) {
      console.error(error);
      return;
    }

    setChecks((checks) => checks?.filter((c) => c.check.uuid !== check.uuid) || []);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <View>
            <Text variant="bodyMedium">Pointages en attente de validation</Text>
            <Divider style={{ marginVertical: 5 }} />
          </View>

          <View>
            {checks?.map(({ employee, check }, index) => (
              <Card key={index} style={{ marginVertical: 5 }}>
                <Card.Title
                  title={`Pointage de l'employé ${employee?.firstName} ${employee?.lastName}`}
                  subtitle={dayJS(check.date).format("DD/MM/YYYY")}
                  subtitleStyle={{ marginTop: -6 }}
                />

                <Card.Content>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Card style={{ flex: 1 }}>
                      <Card.Title
                        title="Pointage d'entrée"
                        subtitle={dayJS(check.start).format("HH[h]mm[m]")}
                        subtitleStyle={{ marginTop: -6 }}
                      />
                    </Card>

                    <Card style={{ flex: 1 }}>
                      <Card.Title
                        title="Pointage de sortie"
                        subtitle={dayJS(check.end).format("HH[h]mm[m]")}
                        subtitleStyle={{ marginTop: -6 }}
                      />
                    </Card>
                  </View>
                </Card.Content>

                <View style={{ marginVertical: 5 }} />

                <Card.Actions>
                  <Button
                    mode="text"
                    // @ts-ignore
                    onPress={() => void navigate("CheckInfoScreen", { check })}>
                    Voir plus</Button>

                  <Button
                    mode="contained-tonal"
                    onPress={() => void approveCheck(check)}
                    icon="check-circle-outline">
                    Accepter
                  </Button>

                  <ChooseDeclineTimeDialog
                    visible={showEditDialog}
                    hideDialog={() => setShowEditDialog(false)}
                    onDismiss={() => setShowEditDialog(false)}
                    onConfirm={({ end, start }) => {
                      setShowEditDialog(false);
                      void rejectCheck(check, start, end);
                    }}
                    startAt={dayJS(check.start).format("HH:mm:ss")}
                    endAt={dayJS(check.end).format("HH:mm:ss")}
                    check={check}
                  />

                  <Button
                    mode="contained-tonal"
                    onPress={() => setShowEditDialog(true)}
                    icon="close-circle-outline">
                    Refuser
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