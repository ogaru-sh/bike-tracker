import styled from "@emotion/native";
import { FILTER_OPTIONS, type FilterPeriod } from "@/config/constants";

type Props = {
  value: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
};

export function RouteFilter({ value, onChange }: Props) {
  return (
    <TabBar>
      {FILTER_OPTIONS.map((opt) => (
        <Tab
          key={opt.value}
          active={value === opt.value}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <TabText active={value === opt.value}>{opt.label}</TabText>
        </Tab>
      ))}
    </TabBar>
  );
}

const TabBar = styled.View`
  flex-direction: row;
  background-color: #1e293b;
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 12px;
`;

const Tab = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  align-items: center;
  background-color: ${(p) => (p.active ? "#3B82F6" : "transparent")};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? "#FFF" : "#94A3B8")};
  font-size: 14px;
  font-weight: 600;
`;
