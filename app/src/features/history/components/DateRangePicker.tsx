import styled from "@emotion/native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

type DateRange = { from: Date; to: Date };

type Props = {
  initial: DateRange;
  onApply: (range: DateRange) => void;
};

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function DateRangePicker({ initial, onApply }: Props) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [editing, setEditing] = useState<"from" | "to">("from");

  const handleChange = useCallback(
    (_: DateTimePickerEvent, date?: Date) => {
      if (!date) return;
      if (editing === "from") {
        setFrom(date);
        const newTo = date > to ? date : to;
        if (date > to) setTo(date);
        onApply({ from: date, to: newTo });
      } else {
        setTo(date);
        const newFrom = date < from ? date : from;
        if (date < from) setFrom(date);
        onApply({ from: newFrom, to: date });
      }
    },
    [editing, from, to, onApply],
  );

  return (
    <Container>
      <TabRow>
        <TabButton active={editing === "from"} onPress={() => setEditing("from")} activeOpacity={0.7}>
          <TabLabel active={editing === "from"}>開始</TabLabel>
          <TabDate active={editing === "from"}>{formatDate(from)}</TabDate>
        </TabButton>
        <Arrow>→</Arrow>
        <TabButton active={editing === "to"} onPress={() => setEditing("to")} activeOpacity={0.7}>
          <TabLabel active={editing === "to"}>終了</TabLabel>
          <TabDate active={editing === "to"}>{formatDate(to)}</TabDate>
        </TabButton>
      </TabRow>

      <PickerWrapper>
        <DateTimePicker
          value={editing === "from" ? from : to}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          maximumDate={new Date()}
          locale="ja"
          themeVariant="dark"
        />
      </PickerWrapper>
    </Container>
  );
}

const Container = styled.View`
  background-color: #1e293b;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const TabRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  align-items: center;
  background-color: ${(p) => (p.active ? "rgba(59, 130, 246, 0.15)" : "#0f172a")};
  border-width: 1.5px;
  border-color: ${(p) => (p.active ? "#3B82F6" : "#334155")};
`;

const TabLabel = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? "#3B82F6" : "#64748b")};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const TabDate = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? "#F8FAFC" : "#94A3B8")};
  font-size: 16px;
  font-weight: 700;
`;

const Arrow = styled.Text`
  color: #475569;
  font-size: 18px;
`;

const PickerWrapper = styled.View`
  align-items: center;
`;
