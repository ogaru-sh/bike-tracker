import styled from "@emotion/native";
import { formatDistance, formatDuration } from "@/utils/format";

type Props = { totalRoutes: number; totalDistanceM: number; totalDurationS: number };

export function RouteSummary({ totalRoutes, totalDistanceM, totalDurationS }: Props) {
  return (
    <Bar>
      <Item><ItemValue>{String(totalRoutes)}</ItemValue><ItemLabel>ルート</ItemLabel></Item>
      <Item><ItemValue>{formatDistance(totalDistanceM)}</ItemValue><ItemLabel>合計距離</ItemLabel></Item>
      <Item><ItemValue>{formatDuration(totalDurationS)}</ItemValue><ItemLabel>合計時間</ItemLabel></Item>
    </Bar>
  );
}

const Bar = styled.View`
  flex-direction: row;
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
  justify-content: space-around;
  margin-bottom: 16px;
`;

const Item = styled.View`
  align-items: center;
`;

const ItemValue = styled.Text`
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
`;

const ItemLabel = styled.Text`
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
`;
