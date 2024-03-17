/* eslint-disable camelcase */
import { useState, type ReactElement } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import type { Database } from "../../lib/db/supabase.types";
import { useSession } from "../../lib/hooks/useSession";
import { supabase } from "../../lib/db/supabase";
import { useAsync } from "../../lib/hooks/useAsync";

export const ChecksApprovalsScreen = (): ReactElement => {
  const { session, role } = useSession();

  const [checks, setChecks] = useState<Database["public"]["Tables"]["checks"]["Row"][] | null>(null);

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

    if (error) console.error("Error:", error);
    if (data) setChecks(data);
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <View>
            <Text variant="bodyMedium">Pointages en attente de validation</Text>
            <Divider style={{ marginVertical: 5 }} />
          </View>

          <View>
            {checks?.map((check, index) => (
              <View key={index}>
                <Text>{check.userId}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};