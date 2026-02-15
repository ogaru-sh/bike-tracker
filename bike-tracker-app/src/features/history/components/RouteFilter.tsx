import { ScrollView } from "react-native";
import styled from "@emotion/native";
import { FILTER_OPTIONS, type FilterPeriod } from "@/config/constants";

type Props = {
  value: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
};

export function RouteFilter({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {FILTER_OPTIONS.map((opt) => (
        <Chip
          key={opt.value}
          active={value === opt.value}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <ChipText active={value === opt.value}>{opt.label}</ChipText>
        </Chip>
      ))}
    </ScrollView>
  );
}

const Chip = styled.TouchableOpacity<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 8px;
  background-color: ${(p) => (p.active ? "#3B82F6" : "#1E293B")};
`;

const ChipText = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? "#FFF" : "#94A3B8")};
  font-size: 14px;
  font-weight: 600;
`;
