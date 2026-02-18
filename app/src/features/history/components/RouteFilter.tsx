import styled from "@emotion/native";
import { FILTER_OPTIONS, type FilterPeriod } from "@/config/constants";

type Props = {
  value: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
  customLabel?: string;
};

export function RouteFilter({ value, onChange, customLabel }: Props) {
  return (
    <Wrapper>
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
      {value === "custom" && customLabel ? (
        <CustomLabel>{customLabel}</CustomLabel>
      ) : null}
    </Wrapper>
  );
}

const Wrapper = styled.View`
  margin-bottom: 12px;
`;

const TabBar = styled.View`
  flex-direction: row;
  background-color: #1e293b;
  border-radius: 12px;
  padding: 3px;
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

const CustomLabel = styled.Text`
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  margin-top: 8px;
`;
