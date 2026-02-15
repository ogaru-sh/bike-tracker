import styled from "@emotion/native";
import { formatDistance, formatDuration, formatDate } from "@/utils/format";
import type { Route } from "../types";

type Props = { route: Route; onPress: () => void; onLongPress: () => void };

export function RouteCard({ route, onPress, onLongPress }: Props) {
  return (
    <Card onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <Title>{route.title || "無題のルート"}</Title>
      <DateText>{formatDate(route.startedAt)}</DateText>
      <StatsRow>
        <Stat>{formatDistance(route.distanceM)}</Stat>
        <Dot>•</Dot>
        <Stat>{formatDuration(route.durationS)}</Stat>
        <Dot>•</Dot>
        <Stat>{(route.avgSpeedKmh ?? 0).toFixed(1)} km/h</Stat>
      </StatsRow>
    </Card>
  );
}

const Card = styled.TouchableOpacity`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
`;

const DateText = styled.Text`
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  gap: 8px;
`;

const Stat = styled.Text`
  color: #94a3b8;
  font-size: 14px;
`;

const Dot = styled.Text`
  color: #475569;
  font-size: 14px;
`;
