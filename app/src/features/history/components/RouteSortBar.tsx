import styled from "@emotion/native";
import { SORT_OPTIONS, type SortKey, type SortOrder } from "@/config/constants";

type Props = {
  sortKey: SortKey;
  sortOrder: SortOrder;
  onChangeSortKey: (key: SortKey) => void;
  onToggleOrder: () => void;
};

export function RouteSortBar({ sortKey, sortOrder, onChangeSortKey, onToggleOrder }: Props) {
  return (
    <Bar>
      {SORT_OPTIONS.map((opt) => (
        <SortChip
          key={opt.value}
          active={sortKey === opt.value}
          onPress={() => onChangeSortKey(opt.value)}
          activeOpacity={0.7}
        >
          <ChipText active={sortKey === opt.value}>{opt.label}</ChipText>
        </SortChip>
      ))}
      <OrderButton onPress={onToggleOrder} activeOpacity={0.7}>
        <OrderText>{sortOrder === "desc" ? "↓" : "↑"}</OrderText>
      </OrderButton>
    </Bar>
  );
}

const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
`;

const SortChip = styled.TouchableOpacity<{ active: boolean }>`
  padding: 6px 14px;
  border-radius: 8px;
  background-color: ${(p) => (p.active ? "#3B82F6" : "#1E293B")};
`;

const ChipText = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? "#FFF" : "#94A3B8")};
  font-size: 13px;
  font-weight: 600;
`;

const OrderButton = styled.TouchableOpacity`
  padding: 6px 10px;
  border-radius: 8px;
  background-color: #1e293b;
`;

const OrderText = styled.Text`
  color: #94a3b8;
  font-size: 16px;
`;
