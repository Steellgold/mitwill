/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-misused-promises */
import type { ReactElement } from "react";
import { View } from "react-native";
import { Divider, IconButton, Text } from "react-native-paper";
import type { dayJS } from "../../../../lib/dayjs/day-js";

type HeaderProps = {
  week: ReturnType<typeof dayJS>;
  refetch?: () => void;
  employeesCount?: number;
};

export const Header = ({ week, refetch, employeesCount = 0 }: HeaderProps): ReactElement => {
  return (
    <View style={{ padding: 15, paddingBottom: 0 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text variant="bodyLarge">Semaine du {week.format("DD/MM")} au {week.add(4, "days").format("DD/MM/YYYY")}</Text>
          <Text variant="bodySmall" style={{ marginTop: 2 }}>Actuellement {employeesCount} employé(s) sélectionné(s)</Text>
        </View>
        <IconButton icon={"calendar-refresh-outline"} onPress={refetch} disabled />
      </View>
      <Divider style={{ marginTop: 10 }} />
    </View>
  );
};